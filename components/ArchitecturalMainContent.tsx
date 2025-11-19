
import React from 'react';
import Card, { CardHeader, CardContent } from './common/Card';
import Select from './common/Select';
import Input from './common/Input';
import Checkbox from './common/Checkbox';
import { ArchFormState } from '../types';

interface ArchitecturalMainContentProps {
  formState: ArchFormState;
  onInputChange: (id: keyof ArchFormState, value: any) => void;
}

const ArchitecturalMainContent: React.FC<ArchitecturalMainContentProps> = ({ formState, onInputChange }) => {
  return (
    <div className="space-y-6">
        {/* New Buildings Section */}
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <span>Нови сгради</span>
                    <Checkbox 
                        id="toggleNewBuildings" 
                        label="Включи" 
                        checked={formState.toggleNewBuildings} 
                        onChange={(e) => onInputChange('toggleNewBuildings', e.target.checked)} 
                    />
                </div>
            </CardHeader>
            {formState.toggleNewBuildings && (
                <CardContent className="space-y-4">
                    <Select label="Вид обект" id="buildingType" value={formState.buildingType} onChange={(e) => onInputChange('buildingType', e.target.value)}>
                        <option value="0">-- Изберете вид --</option>
                        <option value="1">Еднофамилна, Двуфамилна жилищна, Вилна сграда</option>
                        <option value="2">Многофамилна жилищна сграда</option>
                        <option value="3">ОСД, Офиси, Стандартна обществена сграда</option>
                        <option value="4">Специализирана обществена сграда</option>
                        <option value="5">Навес, Склад, Едно-пространствена сграда без МТ</option>
                        <option value="6">Промишлена, Селскостопанска сграда</option>
                    </Select>
                    <Input label="РЗП (м²)" id="area" type="number" min="0" placeholder="Въведете площ" value={formState.area > 0 ? formState.area : ''} onChange={(e) => onInputChange('area', e.target.valueAsNumber || 0)} />
                    <Select label="Фаза на проектиране" id="phase" value={formState.phase} onChange={(e) => onInputChange('phase', parseInt(e.target.value))}>
                        <option value="0">-- Изберете фаза --</option>
                        <option value="1">Предпроектно проучване</option>
                        <option value="2">Идеен проект</option>
                        <option value="3">Технически проект</option>
                        <option value="4">Работен проект</option>
                    </Select>
                </CardContent>
            )}
        </Card>

        {/* PUP Section */}
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <span>Подробни устройствени планове</span>
                    <Checkbox 
                        id="toggleDevelopmentPlans" 
                        label="Включи" 
                        checked={formState.toggleDevelopmentPlans} 
                        onChange={(e) => onInputChange('toggleDevelopmentPlans', e.target.checked)} 
                    />
                </div>
            </CardHeader>
            {formState.toggleDevelopmentPlans && (
                <CardContent className="space-y-4">
                     <Select label="Вид ПУП" id="planType" value={formState.planType} onChange={(e) => onInputChange('planType', e.target.value)}>
                        <option value="0">-- Изберете вид ПУП --</option>
                        <option value="1">План за застрояване</option>
                        <option value="2">План за регулация и застрояване</option>
                        <option value="3">Работен устройствен план</option>
                     </Select>
                     <Input label="Брой (У)ПИ" id="plotCount" type="number" min="1" placeholder="Въведете брой" value={formState.plotCount > 0 ? formState.plotCount : ''} onChange={(e) => onInputChange('plotCount', e.target.valueAsNumber || 0)} />
                     <Select label="Площ (У)ПИ" id="plotArea" value={formState.plotArea} onChange={(e) => onInputChange('plotArea', e.target.value)}>
                        <option value="0">-- Изберете площ --</option>
                        <option value="1">≤ 1 дка</option>
                        <option value="2">1 - 5 дка</option>
                        <option value="3">5 - 10 дка</option>
                        <option value="4">&gt; 10 дка</option>
                     </Select>
                </CardContent>
            )}
        </Card>

        {/* Hourly Section */}
        <Card>
             <CardHeader>
                <div className="flex items-center justify-between">
                    <span>Часова ставка</span>
                    <Checkbox 
                        id="toggleHourlyRate" 
                        label="Включи" 
                        checked={formState.toggleHourlyRate} 
                        onChange={(e) => onInputChange('toggleHourlyRate', e.target.checked)} 
                    />
                </div>
            </CardHeader>
            {formState.toggleHourlyRate && (
                <CardContent className="space-y-4">
                    <Select label="Тип проектант" id="designerType" value={formState.designerType} onChange={(e) => onInputChange('designerType', e.target.value)}>
                        <option value="0">-- Изберете тип --</option>
                        <option value="200.00">С пълна правоспособност (200.00 лв/ч)</option>
                        <option value="162.50">С ограничена правоспособност (162.50 лв/ч)</option>
                        <option value="100.00">За технически сътрудник (100.00 лв/ч)</option>
                    </Select>
                    <Input label="Брой часове" id="hours" type="number" min="0" placeholder="Въведете часове" value={formState.hours > 0 ? formState.hours : ''} onChange={(e) => onInputChange('hours', e.target.valueAsNumber || 0)} />
                </CardContent>
            )}
        </Card>
    </div>
  );
};

export default ArchitecturalMainContent;
