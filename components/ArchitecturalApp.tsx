
import React, { useState, useEffect, useCallback } from 'react';
import { ArchFormState, CalculationResult, SavedProject } from '../types';
import { useArchCalculation } from '../hooks/useArchCalculation';
import { saveStateToFile, exportToTxt, printOffer, exportWorkspaceToFile } from '../services/fileService';
import Sidebar from './Sidebar';
import Results from './Results';
import PriceTableModal from './PriceTableModal';
import ConfirmModal from './ConfirmModal';
import { ARCH_INITIAL_STATE } from '../constants';
import ArchitecturalMainContent from './ArchitecturalMainContent';
import Card, { CardContent, CardHeader } from './common/Card';
import Checkbox from './common/Checkbox';
import Input from './common/Input';
import Button from './common/Button';

// UNIQUE KEYS FOR ARCHITECTURAL CALCULATOR
const WORKSPACE_STORAGE_KEY = 'arch_workspace_data';
const WORKSPACE_NAME_KEY = 'arch_workspace_name';
const ARCH_CURRENT_STATE_KEY = 'arch_current_state';

// Helper to sanitize loaded projects
const sanitizeProject = (p: any): SavedProject => {
    const fallbackId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const rawId = p.id || (p.data && p.data.id);
    const finalId = rawId ? String(rawId) : fallbackId;
  
    if (p && typeof p === 'object' && 'data' in p) {
        return {
            id: finalId,
            name: p.name || p.data.objectName || 'Без име',
            lastModified: Number(p.lastModified) || Date.now(),
            type: p.type || 'architectural',
            data: p.data,
            isArchived: !!p.isArchived
        };
    }
    return {
        id: finalId,
        name: p.objectName || 'Импортиран проект',
        lastModified: Date.now(),
        type: 'architectural',
        data: p,
        isArchived: false
    };
};

interface ArchitecturalAppProps {
    onBack: () => void;
    isSidebarOpen: boolean;
}

export default function ArchitecturalApp({ onBack, isSidebarOpen }: ArchitecturalAppProps) {
    const [formState, setFormState] = useState<ArchFormState>(() => {
        const saved = localStorage.getItem(ARCH_CURRENT_STATE_KEY);
        return saved ? JSON.parse(saved) : ARCH_INITIAL_STATE;
    });
    const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
    const [workspaceName, setWorkspaceName] = useState<string>('');
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
    const [notification, setNotification] = useState<string | null>(null);
    const [isPriceTableOpen, setIsPriceTableOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{isOpen: boolean; message: string; onConfirm: () => void;}>({
        isOpen: false, message: '', onConfirm: () => {},
    });

    const calculationResult: CalculationResult = useArchCalculation(formState);

    // Persist current form state
    useEffect(() => {
        localStorage.setItem(ARCH_CURRENT_STATE_KEY, JSON.stringify(formState));
    }, [formState]);

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

    const handleInputChange = useCallback((id: keyof ArchFormState, value: any) => {
        setFormState(prevState => ({ ...prevState, [id]: value }));
    }, []);

    const handleSaveToWorkspace = useCallback((asNew: boolean = false) => {
        const now = Date.now();
        const finalName = (formState.objectName || '').trim() || `АРХ Проект ${new Date(now).toLocaleString('bg-BG')}`;
        if (!formState.objectName) setFormState(prev => ({...prev, objectName: finalName}));
        
        if (currentProjectId && !asNew) {
            setSavedProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, name: finalName, lastModified: now, data: { ...formState, objectName: finalName }, type: 'architectural' } : p));
            showNotification("Промените са запазени.");
        } else {
            const newId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            setSavedProjects(prev => [{ id: newId, name: finalName, lastModified: now, data: { ...formState, objectName: finalName }, isArchived: false, type: 'architectural' }, ...prev]);
            setCurrentProjectId(newId);
            showNotification("Проектът е добавен.");
        }
    }, [currentProjectId, formState]);

    const handleLoadProject = useCallback((id: string) => {
        const project = savedProjects.find(p => String(p.id) === String(id));
        if (project) {
            if (project.type && project.type !== 'architectural') {
                if (!confirm("Този проект е от друг тип калкулатор (СК). Искате ли да го заредите? Това може да доведе до грешки.")) return;
            }
            setFormState(project.data);
            setCurrentProjectId(project.id);
            showNotification(`Зареден: ${project.name}`);
        }
    }, [savedProjects]);

    const handleDeleteProject = useCallback((id: string) => {
        setConfirmModal({
            isOpen: true, 
            message: "Сигурни ли сте?", 
            onConfirm: () => {
                setSavedProjects(prev => prev.filter(p => String(p.id) !== String(id)));
                if (currentProjectId && String(currentProjectId) === String(id)) {
                    setCurrentProjectId(null);
                    setFormState(ARCH_INITIAL_STATE);
                }
            }
        });
    }, [currentProjectId]);

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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="secondary" onClick={onBack} className="mb-4 text-sm">← Обратно към начало</Button>
                <h2 className="text-xl font-bold text-bunker-800 dark:text-bunker-100 text-center flex-1 mr-auto ml-4">
                    Калкулатор за минимална себестойност на проектиране – ЧАСТ АРХИТЕКТУРА
                </h2>
            </div>

            <div className={`grid grid-cols-1 ${isSidebarOpen ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-8`}>
                <div className={`${isSidebarOpen ? 'lg:col-span-2' : ''} space-y-8`}>
                    <ArchitecturalMainContent formState={formState} onInputChange={handleInputChange} />
                    <Results
                        result={calculationResult}
                        formState={formState}
                        onPrint={() => printOffer(formState as any, calculationResult)}
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
                        onNewProject={() => {setFormState(ARCH_INITIAL_STATE); setCurrentProjectId(null);}}
                        onSaveToWorkspace={handleSaveToWorkspace}
                        onLoadProject={handleLoadProject}
                        onDeleteProject={handleDeleteProject}
                        onArchiveProject={(id) => setSavedProjects(prev => prev.map(p => p.id === id ? {...p, isArchived: true} : p))}
                        onUnarchiveProject={(id) => setSavedProjects(prev => prev.map(p => p.id === id ? {...p, isArchived: false} : p))}
                        onReorderProjects={setSavedProjects}
                        onClearWorkspace={() => setSavedProjects([])}
                        onExportWorkspace={() => exportWorkspaceToFile(workspaceName, savedProjects)}
                        onImportWorkspace={() => {}}
                        onClearCurrentForm={() => setConfirmModal({isOpen: true, message: "Изчисти форма?", onConfirm: () => setFormState(prev => ({...ARCH_INITIAL_STATE, objectName: prev.objectName}))})}
                        onExportFile={() => saveStateToFile(formState as any)}
                        onFileLoad={handleImportMultipleProjects}
                        onOpenPriceTable={() => setIsPriceTableOpen(true)}
                    >
                        {/* Architectural Specific Settings */}
                        <Card>
                            <CardHeader>Допълнителни коефициенти</CardHeader>
                            <CardContent className="space-y-4">
                                <Checkbox id="coefVariant" label="Разработване на варианти (+50%)" checked={formState.coefVariant} onChange={(e) => handleInputChange('coefVariant', e.target.checked)} />
                                
                                <Input label="Общ брой повторения/огледални" id="repetitions" type="number" min="0" placeholder="напр. 3" value={formState.repetitions > 0 ? formState.repetitions : ''} onChange={(e) => handleInputChange('repetitions', e.target.valueAsNumber || 0)} />
                                
                                <Checkbox id="coefReconstructionExisting" label="Реконструкция (с налична док.) (x1.5)" checked={formState.coefReconstructionExisting} onChange={(e) => { handleInputChange('coefReconstructionExisting', e.target.checked); if(e.target.checked) handleInputChange('coefReconstructionMissing', false); }} />
                                <Checkbox id="coefReconstructionMissing" label="Реконструкция (без налична док.) (x2.0)" checked={formState.coefReconstructionMissing} onChange={(e) => { handleInputChange('coefReconstructionMissing', e.target.checked); if(e.target.checked) handleInputChange('coefReconstructionExisting', false); }} />
                                
                                <Checkbox id="coefAccelerated" label="Ускорено проектиране (+50%)" checked={formState.coefAccelerated} onChange={(e) => handleInputChange('coefAccelerated', e.target.checked)} />
                                
                                <div className="pt-2 border-t border-bunker-100 dark:border-bunker-700">
                                    <Input label="Трудност (+/- %)" id="difficultyPercent" type="number" placeholder="напр. 10" value={formState.difficultyPercent !== 0 ? formState.difficultyPercent : ''} onChange={(e) => handleInputChange('difficultyPercent', e.target.valueAsNumber || 0)} />
                                    <div className="mt-2">
                                        <Input label="Пояснение за трудност" id="difficultyNotes" type="text" value={formState.difficultyNotes} onChange={(e) => handleInputChange('difficultyNotes', e.target.value)} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Sidebar>
                </div>
            </div>

            <PriceTableModal isOpen={isPriceTableOpen} onClose={() => setIsPriceTableOpen(false)} type="architectural" />
            <ConfirmModal isOpen={confirmModal.isOpen} message={confirmModal.message} onConfirm={confirmModal.onConfirm} onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} />
        </div>
    );
}
