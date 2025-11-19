
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StructuralFormState, CalculationResult, SavedProject } from '../types';
import { useCalculation } from '../hooks/useCalculation';
import { saveStateToFile, exportToTxt, printOffer, exportWorkspaceToFile } from '../services/fileService';
import MainContent from './MainContent';
import Sidebar from './Sidebar';
import Results from './Results';
import PriceTableModal from './PriceTableModal';
import ConfirmModal from './ConfirmModal';
import { STRUCTURAL_INITIAL_STATE, constructionTypes, structuralPriceTableData as priceTableData } from '../constants';
import Card, { CardContent, CardHeader } from './common/Card';
import Checkbox from './common/Checkbox';
import Input from './common/Input';
import Button from './common/Button';
import { XIcon } from './icons';

// UNIQUE KEYS FOR STRUCTURAL CALCULATOR
const WORKSPACE_STORAGE_KEY = 'struct_workspace_data';
const WORKSPACE_NAME_KEY = 'struct_workspace_name';
const CURRENT_STATE_KEY = 'struct_current_state';

const sanitizeProject = (p: any): SavedProject => {
  const fallbackId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  const rawId = p.id || (p.data && p.data.id);
  const finalId = rawId ? String(rawId) : fallbackId;

  if (p && typeof p === 'object' && 'data' in p) {
      return {
          id: finalId,
          name: p.name || p.data.objectName || 'Без име',
          lastModified: Number(p.lastModified) || Date.now(),
          type: p.type || 'structural',
          data: p.data,
          isArchived: !!p.isArchived
      };
  }
  
  return {
      id: finalId,
      name: p.objectName || 'Импортиран проект',
      lastModified: Date.now(),
      type: 'structural',
      data: p,
      isArchived: false
  };
};

interface StructuralAppProps {
    onBack: () => void;
    isSidebarOpen: boolean;
}

export default function StructuralApp({ onBack, isSidebarOpen }: StructuralAppProps) {
  const [formState, setFormState] = useState<StructuralFormState>(() => {
      const saved = localStorage.getItem(CURRENT_STATE_KEY);
      return saved ? JSON.parse(saved) : STRUCTURAL_INITIAL_STATE;
  });
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [workspaceName, setWorkspaceName] = useState<string>('');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isPriceTableOpen, setIsPriceTableOpen] = useState(false);
  
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean; message: string; onConfirm: () => void;}>({
    isOpen: false, message: '', onConfirm: () => {},
  });

  const calculationResult: CalculationResult = useCalculation(formState);

  // Persist current form state
  useEffect(() => {
      localStorage.setItem(CURRENT_STATE_KEY, JSON.stringify(formState));
  }, [formState]);

  // Initialize Workspace
  useEffect(() => {
    const savedWorkspace = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    const savedWorkspaceName = localStorage.getItem(WORKSPACE_NAME_KEY);
    if (savedWorkspaceName) setWorkspaceName(savedWorkspaceName);
    if (savedWorkspace) {
      try {
        const loadedProjects = JSON.parse(savedWorkspace);
        if (Array.isArray(loadedProjects)) setSavedProjects(loadedProjects.map(sanitizeProject));
      } catch (error) { console.error("Failed to parse workspace", error); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(savedProjects));
  }, [savedProjects]);
  useEffect(() => {
      localStorage.setItem(WORKSPACE_NAME_KEY, workspaceName);
  }, [workspaceName]);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const openConfirm = (message: string, onConfirm: () => void) => setConfirmModal({ isOpen: true, message, onConfirm });

  const handleInputChange = useCallback((id: any, value: any) => {
    setFormState(prevState => {
      const newState = { ...prevState, [id]: value };
      if (id === 'projectType') {
        newState.area = 0;
        newState.wallSections = 1;
        newState.additionalLength = 0;
      }
      if (id === 'hasComplexity' && !value) newState.complexityPercentage = 0;
      return newState;
    });
  }, []);
  
  const handleSaveToWorkspace = useCallback((asNew: boolean = false) => {
    const now = Date.now();
    const finalName = (formState.objectName || '').trim() || `СК Проект ${new Date(now).toLocaleString('bg-BG')}`;
    if (!formState.objectName) setFormState(prev => ({...prev, objectName: finalName}));
    
    if (currentProjectId && !asNew) {
      setSavedProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, name: finalName, lastModified: now, data: { ...formState, objectName: finalName }, type: 'structural' } : p));
      showNotification("Промените са запазени.");
    } else {
      const newId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      setSavedProjects(prev => [{ id: newId, name: finalName, lastModified: now, data: { ...formState, objectName: finalName }, isArchived: false, type: 'structural' }, ...prev]);
      setCurrentProjectId(newId);
      showNotification("Проектът е добавен.");
    }
  }, [currentProjectId, formState]);

  const handleLoadProject = useCallback((id: string) => {
    const project = savedProjects.find(p => String(p.id) === String(id));
    if (project) {
        if (project.type && project.type !== 'structural') {
            if (!confirm("Този проект е от друг тип калкулатор. Искате ли да го заредите въпреки това? Данните може да са непълни.")) return;
        }
        setFormState(project.data);
        setCurrentProjectId(project.id);
        showNotification(`Зареден: ${project.name}`);
    }
  }, [savedProjects]);

  const handleDeleteProject = useCallback((id: string) => {
    openConfirm("Сигурни ли сте?", () => {
        setSavedProjects(prev => prev.filter(p => String(p.id) !== String(id)));
        if (currentProjectId && String(currentProjectId) === String(id)) {
            setCurrentProjectId(null);
            setFormState(STRUCTURAL_INITIAL_STATE);
        }
    });
  }, [currentProjectId]);

  const handleArchiveProject = useCallback((id: string) => {
      setSavedProjects(prev => prev.map(p => String(p.id) === String(id) ? { ...p, isArchived: true } : p));
      if (currentProjectId && String(currentProjectId) === String(id)) { setCurrentProjectId(null); setFormState(STRUCTURAL_INITIAL_STATE); }
  }, [currentProjectId]);

  const handleUnarchiveProject = useCallback((id: string) => {
      setSavedProjects(prev => prev.map(p => String(p.id) === String(id) ? { ...p, isArchived: false } : p));
  }, []);

  const handleImportMultipleProjects = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;
      const projectsToAdd: SavedProject[] = [];
      for (let i = 0; i < files.length; i++) {
          try {
              const text = await files[i].text();
              const parsed = JSON.parse(text);
              if (Array.isArray(parsed)) parsed.forEach(p => projectsToAdd.push(sanitizeProject(p)));
              else if (parsed.projects) parsed.projects.forEach((p: any) => projectsToAdd.push(sanitizeProject(p)));
              else projectsToAdd.push(sanitizeProject(parsed));
          } catch (e) {}
      }
      if (projectsToAdd.length > 0) setSavedProjects(prev => [...projectsToAdd, ...prev]);
      event.target.value = '';
  }, []);
  
  const selectedType = constructionTypes[formState.projectType];
  const category = formState.projectType.split('.')[0];
  const isCraneEligible = category === 'V' || category === 'VI';
  const showCoefficients = selectedType && category !== 'I' && category !== 'VII';

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
             <Button variant="secondary" onClick={onBack} className="mb-4 text-sm">← Обратно към начало</Button>
             <h2 className="text-xl font-bold text-bunker-800 dark:text-bunker-100 text-center flex-1 mr-auto ml-4">
                Калкулатор за минимална себестойност на проектиране – ЧАСТ КОНСТРУКЦИИ
             </h2>
        </div>

        <div className={`grid grid-cols-1 ${isSidebarOpen ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-8`}>
          <div className={`${isSidebarOpen ? 'lg:col-span-2' : ''} space-y-8`}>
            <MainContent formState={formState} onInputChange={handleInputChange} />
            <Results
              result={calculationResult}
              formState={formState}
              onPrint={() => printOffer(formState, calculationResult)}
              onExport={() => exportToTxt(calculationResult.log, calculationResult.currentTotal, formState.objectName, formState.currencyDisplay)}
            />
          </div>
          
          <div className={`${isSidebarOpen ? 'lg:col-span-1' : 'hidden lg:hidden'}`}>
            <Sidebar
                formState={formState}
                savedProjects={savedProjects}
                workspaceName={workspaceName}
                setWorkspaceName={setWorkspaceName}
                currentProjectId={currentProjectId}
                notification={notification}
                onInputChange={handleInputChange}
                onNewProject={() => {setFormState(STRUCTURAL_INITIAL_STATE); setCurrentProjectId(null);}}
                onSaveToWorkspace={handleSaveToWorkspace}
                onLoadProject={handleLoadProject}
                onDeleteProject={handleDeleteProject}
                onArchiveProject={handleArchiveProject}
                onUnarchiveProject={handleUnarchiveProject}
                onReorderProjects={setSavedProjects}
                onClearWorkspace={() => setSavedProjects([])}
                onExportWorkspace={() => exportWorkspaceToFile(workspaceName, savedProjects)}
                onImportWorkspace={(e) => {}}
                onClearCurrentForm={() => openConfirm("Изчисти форма?", () => setFormState(prev => ({...STRUCTURAL_INITIAL_STATE, objectName: prev.objectName})))}
                onExportFile={() => saveStateToFile(formState)}
                onFileLoad={handleImportMultipleProjects} 
                onOpenPriceTable={() => setIsPriceTableOpen(true)}
            >
                {showCoefficients && (
                    <Card>
                    <CardHeader>Допълнителни коефициенти</CardHeader>
                    <CardContent className="space-y-4">
                        {isCraneEligible && (
                        <Checkbox
                            id="hasCrane"
                            label="Хале с кран (+1.00 €/м²)"
                            checked={formState.hasCrane}
                            onChange={(e) => handleInputChange('hasCrane', e.target.checked)}
                        />
                        )}
                        <Checkbox
                        id="hasComplexity"
                        label="Сложна геометрия/терен"
                        checked={formState.hasComplexity}
                        onChange={(e) => handleInputChange('hasComplexity', e.target.checked)}
                        />
                        {formState.hasComplexity && (
                        <Input
                                label="Процент оскъпяване (+%)"
                                id="complexityPercentage"
                                type="number"
                                min="0" max="100"
                                placeholder="напр. 15"
                                value={formState.complexityPercentage > 0 ? formState.complexityPercentage : ''}
                                onChange={(e) => handleInputChange('complexityPercentage', e.target.valueAsNumber || 0)}
                            />
                        )}
                        <Checkbox
                        id="isAccelerated"
                        label="Ускорено проектиране (+50%)"
                        checked={formState.isAccelerated}
                        onChange={(e) => handleInputChange('isAccelerated', e.target.checked)}
                        />
                        <Checkbox
                        id="includeSupervision"
                        label="Авторски надзор (+15%)"
                        checked={formState.includeSupervision}
                        onChange={(e) => handleInputChange('includeSupervision', e.target.checked)}
                        />
                    </CardContent>
                    </Card>
                )}
            </Sidebar>
          </div>
        </div>

        <PriceTableModal isOpen={isPriceTableOpen} onClose={() => setIsPriceTableOpen(false)} data={priceTableData} type="structural" />
        <ConfirmModal isOpen={confirmModal.isOpen} message={confirmModal.message} onConfirm={confirmModal.onConfirm} onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} />
    </div>
  );
}
