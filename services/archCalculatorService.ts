
import { ArchFormState, CalculationResult } from '../types';
import { archNewBuildingPrices, archPlanPrices, archBuildingTypeMap, archDesignPhaseMap, EURO_RATE } from '../constants';

export function calculateArch(inputs: ArchFormState): CalculationResult {
    let newBuildingPrice = 0, pupPrice = 0, hourlyPrice = 0;
    let log: string[] = [];
    let hintMessages: string[] = [];
    let currentTotal = 0;
    // Prices in the provided JS are in BGN. We need to work in BGN internally based on that logic, 
    // but the app expects EURO based logic usually. 
    // HOWEVER, the JS provided calculates in BGN.
    // We will calculate in BGN then convert if necessary for display, 
    // but the result object usually expects Euro in the Structural calc.
    // For consistency, we will calculate in BGN (since the data is BGN/Euro mix but logic uses BGN primarily in the JS provided)
    // and then return the EUR equivalent as 'currentTotal' because the UI converts it back.
    
    // Wait, the provided JS constants have both, but the logic:
    // "const eurAmount = (parseFloat(bgnAmount) / EURO_RATE).toFixed(2);" implies the logs are generated in BGN.
    
    if (inputs.toggleNewBuildings) {
        const isComplete = inputs.buildingType !== "0" && inputs.area > 0 && inputs.phase !== 0;
        if (isComplete) {
            const prices = archNewBuildingPrices[inputs.buildingType];
            const minArea = parseFloat(Object.keys(prices.min)[0]);
            if (inputs.area <= minArea) {
                // prices.min[area][phase-1] returns BGN
                newBuildingPrice = prices.min[minArea][inputs.phase - 1];
                log.push(`Нови сгради (${archBuildingTypeMap[inputs.buildingType]}, ${archDesignPhaseMap[inputs.phase]}): ${newBuildingPrice.toFixed(2)} лв. (мин. цена)`);
            } else {
                const areaRanges = Object.keys(prices.per_sqm).map(Number).sort((a, b) => a - b);
                let rate = prices.per_sqm["Infinity"][inputs.phase - 1];
                for (const range of areaRanges) {
                    if (inputs.area <= range) { rate = prices.per_sqm[range][inputs.phase - 1]; break; }
                }
                newBuildingPrice = inputs.area * rate;
                log.push(`Нови сгради (${archBuildingTypeMap[inputs.buildingType]}, ${archDesignPhaseMap[inputs.phase]}): ${inputs.area} м² * ${rate.toFixed(2)} лв./м² = ${newBuildingPrice.toFixed(2)} лв.`);
            }
        } else {
            hintMessages.push("Попълнете вид, РЗП и фаза за 'Нови сгради'.");
        }
    }

    if (inputs.toggleDevelopmentPlans) {
        const isComplete = inputs.planType !== "0" && inputs.plotCount > 0 && inputs.plotArea !== "0";
        if (isComplete) {
            let plotCountCategory;
            if (inputs.plotCount === 1) plotCountCategory = 1;
            else if (inputs.plotCount >= 2 && inputs.plotCount <= 4) plotCountCategory = 2;
            else plotCountCategory = 3;
            
            // planPrices returns BGN
            const pricePerPlot = archPlanPrices[inputs.planType][plotCountCategory][parseInt(inputs.plotArea) - 1];
            pupPrice = pricePerPlot * inputs.plotCount;
            log.push(`ПУП (${inputs.plotCount} бр.): ${inputs.plotCount} * ${pricePerPlot.toFixed(2)} лв./бр. = ${pupPrice.toFixed(2)} лв.`);
        } else {
            hintMessages.push("Попълнете вид ПУП, брой и площ на имотите.");
        }
    }

    if (inputs.toggleHourlyRate) {
        const isComplete = parseFloat(inputs.designerType) > 0 && inputs.hours > 0;
        if (isComplete) {
            const rate = parseFloat(inputs.designerType);
            hourlyPrice = rate * inputs.hours;
            log.push(`Часова ставка: ${inputs.hours} ч. * ${(rate).toFixed(2)} лв./ч. = ${hourlyPrice.toFixed(2)} лв.`);
        } else {
            hintMessages.push("Попълнете тип проектант и часове.");
        }
    }

    let totalBasePrice = newBuildingPrice + pupPrice + hourlyPrice;
    
    let adjustedBuildingPrice = newBuildingPrice;
    let coefLog: string[] = [];
    const buildingsBaseForCoef = newBuildingPrice;

    if (inputs.difficultyPercent !== 0 && buildingsBaseForCoef > 0) {
        const difficultyAddition = buildingsBaseForCoef * (inputs.difficultyPercent / 100);
        adjustedBuildingPrice += difficultyAddition;
        let logMsg = `+ Трудност (${inputs.difficultyPercent > 0 ? '+' : ''}${inputs.difficultyPercent}%): ${difficultyAddition.toFixed(2)} лв.`;
        if (inputs.difficultyNotes) logMsg += ` (${inputs.difficultyNotes})`;
        coefLog.push(logMsg);
    }
    
    if (inputs.coefVariant && buildingsBaseForCoef > 0) { 
        const variantAddition = buildingsBaseForCoef * 0.5; 
        adjustedBuildingPrice += variantAddition; 
        coefLog.push(`+ Доп. вариант: +${variantAddition.toFixed(2)} лв.`); 
    }
    
    if (inputs.repetitions > 1 && buildingsBaseForCoef > 0) {
        const extraUnits = inputs.repetitions - 1;
        const coef = inputs.repetitions >= 6 ? 0.4 : 0.5;
        const repetitionAddition = extraUnits * buildingsBaseForCoef * coef;
        adjustedBuildingPrice += repetitionAddition;
        coefLog.push(`+ ${extraUnits} Повторения (x${coef}): +${repetitionAddition.toFixed(2)} лв.`);
    }

    const multCheckboxes = [
        { checked: inputs.coefReconstructionExisting, text: 'Реконструкция (с налична док.)', value: 1.5 },
        { checked: inputs.coefReconstructionMissing, text: 'Реконструкция (без налична док.)', value: 2.0 },
        { checked: inputs.coefAccelerated, text: 'Ускорено проектиране', value: 1.5 }
    ];

    multCheckboxes.forEach(cb => {
        if (cb.checked && newBuildingPrice > 0) {
            const priceBeforeMult = adjustedBuildingPrice;
            adjustedBuildingPrice *= cb.value;
            coefLog.push(`* ${cb.text}: ${priceBeforeMult.toFixed(2)} лв. * ${cb.value} = ${adjustedBuildingPrice.toFixed(2)} лв.`);
        }
    });

    if (coefLog.length > 0) {
        log.push(`<b>Коефициенти (приложени към 'Нови сгради'):</b>\n${coefLog.join('\n')}`);
    }

    const finalTotalBGN = adjustedBuildingPrice + pupPrice + hourlyPrice;
    
    const summaryParts = [];
    if (adjustedBuildingPrice > 0) summaryParts.push(`${adjustedBuildingPrice.toFixed(2)} лв. (Сгради)`);
    if (pupPrice > 0) summaryParts.push(`${pupPrice.toFixed(2)} лв. (ПУП)`);
    if (hourlyPrice > 0) summaryParts.push(`${hourlyPrice.toFixed(2)} лв. (Часова ст.)`);

    if (summaryParts.length > 1) {
        log.push(`<b>ОБЩО = ${summaryParts.join(' + ')} = ${finalTotalBGN.toFixed(2)} лв.</b>`);
    }
    
    if (inputs.toggleNewBuildings && inputs.toggleDevelopmentPlans && inputs.toggleHourlyRate && finalTotalBGN === 0) {
        // Everything toggled on but empty
        if(hintMessages.length === 0) hintMessages.push("Моля въведете данни.");
    } else if (!inputs.toggleNewBuildings && !inputs.toggleDevelopmentPlans && !inputs.toggleHourlyRate) {
         hintMessages.push("Моля изберете поне една секция от настройките.");
    }

    if (hintMessages.length > 0) {
        const hintText = `<b>За довършване:</b>\n- ${hintMessages.join('\n- ')}`;
        // Add to log only if we want to show it inline, but usually hints are separate. 
        // For this UI pattern, we often append to log or show error.
        // We'll treat it as log info.
        // log.push(hintText);
    }

    // Convert BGN to EUR for the system consistency (system expects 'currentTotal' in EUR usually)
    // The UI Results component converts EUR to BGN/Both.
    // So we must divide by EURO_RATE.
    const finalTotalEUR = finalTotalBGN / EURO_RATE;

    // Since the LOG messages are hardcoded in BGN in this service, 
    // we need to handle how the Results component displays them.
    // The current Results component expects log lines to contain "€". 
    // If we send "лв.", the Results component regex won't pick it up for conversion.
    // To allow the Results component to work for both, we should probably convert the Log messages to use € 
    // OR modify Results.tsx to handle BGN logs.
    // Given the specific Regex in Results.tsx: line.replace(/(\d+\.\d{2})\s*€/g ...
    // It expects Euro. 
    
    // Let's rewrite the log messages to be in Euro for consistency with the platform?
    // No, the user specifically provided a JS file that outputs BGN logs.
    // I will Modify Results.tsx to detect BGN logs and handle them, OR 
    // I will convert the Log strings here to match the format Results.tsx expects?
    // The cleanest way is to modify Results.tsx to handle raw text better or just replace the BGN text here.
    
    // ACTUALLY: The provided JS has logic to replace BGN with Euro in the UI layer.
    // "line.replace(/(\d+\.\d{2})\s*лв\./g, ...)"
    // So I should return BGN logs, and update Results.tsx to handle BGN source text too.

    return { 
        currentTotal: finalTotalEUR, 
        log: log, 
        error: false,
        hintMessages 
    };
}
