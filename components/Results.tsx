
import React from 'react';
import Card, { CardContent } from './common/Card';
import Button from './common/Button';
import { CalculationResult, FormState } from '../types';
import { EURO_RATE } from '../constants';
import { PrinterIcon, DownloadIcon } from './icons';

interface ResultsProps {
  result: CalculationResult;
  formState: FormState | any;
  onPrint: () => void;
  onExport: () => void;
}

const Results: React.FC<ResultsProps> = ({ result, formState, onPrint, onExport }) => {
  const { currentTotal, log, error, hintMessages } = result;
  const { currencyDisplay, objectName } = formState;

  const formatPrice = (): string => {
    if (error) return '---';
    // currentTotal is always EUR coming from the services
    const totalInBgn = currentTotal * EURO_RATE;
    switch (currencyDisplay) {
      case 'bgn':
        return `${totalInBgn.toFixed(2)} лв.`;
      case 'both':
        return `${totalInBgn.toFixed(2)} лв. (${currentTotal.toFixed(2)} €)`;
      default: // eur
        return `${currentTotal.toFixed(2)} €`;
    }
  };
  
  const getHeader = (): string => {
      switch (currencyDisplay) {
        case 'bgn': return 'ОБЩО (лв. без ДДС):';
        case 'both': return 'ОБЩО (без ДДС):';
        default: return 'ОБЩО (€ без ДДС):';
      }
  }

  const formatLog = (logLines: string[]): React.ReactNode[] => {
    return logLines.map((line, index) => {
        const parts = line.split('\n').map((part, partIndex) => {
            let formattedPart = part;
            
            // If currency display is BGN or Both, we want to convert EURO prices in the log to BGN.
            // The Architectural calculator outputs logs with "лв.", while Structural outputs "€".
            
            // Case 1: Log has € (Structural)
            if (formattedPart.includes('€') && (currencyDisplay === 'bgn' || currencyDisplay === 'both')) {
                formattedPart = formattedPart.replace(/(\d+\.\d{2})\s*€/g, (match, eurValue) => {
                    const bgnValue = (parseFloat(eurValue) * EURO_RATE).toFixed(2);
                    return currencyDisplay === 'bgn' ? `${bgnValue} лв.` : `${bgnValue} лв. (${match})`;
                });
            }
            
            // Case 2: Log has лв. (Architectural)
            // If the user wants EUR, we should ideally convert BGN logs to EUR.
            else if (formattedPart.includes('лв.') && (currencyDisplay === 'eur' || currencyDisplay === 'both')) {
                 formattedPart = formattedPart.replace(/(\d+\.\d{2})\s*лв\./g, (match, bgnValue) => {
                    const eurValue = (parseFloat(bgnValue) / EURO_RATE).toFixed(2);
                    return currencyDisplay === 'eur' ? `${eurValue} €` : `${match} (${eurValue} €)`;
                });
            }

            return <span key={`${index}-${partIndex}`} dangerouslySetInnerHTML={{ __html: formattedPart }} />;
        });

        return <div key={index} className="whitespace-pre-wrap">{parts.map((p, i) => <React.Fragment key={i}>{p}{i < parts.length - 1 && <br />}</React.Fragment>)}</div>
    });
  };

  return (
    <Card className="bg-gradient-to-br from-bunker-50 to-bunker-100 dark:from-bunker-900 dark:to-bunker-950">
      <CardContent className="text-center space-y-4">
        {objectName && <h3 className="text-2xl font-bold text-bunker-800 dark:text-bunker-100">{objectName}</h3>}
        <h2 className="text-lg font-semibold text-bunker-600 dark:text-bunker-300">{getHeader()}</h2>
        <p className={`text-4xl md:text-5xl font-bold ${error ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
          {formatPrice()}
        </p>
        
        {/* Logs Container - Fixed Height to prevent jumping */}
        <div className="bg-white dark:bg-bunker-800/50 p-4 rounded-lg text-left font-mono text-sm text-bunker-700 dark:text-bunker-300 h-72 overflow-y-auto custom-scrollbar">
          {error ? (
            <div className="text-red-500 font-semibold flex items-center justify-center h-full whitespace-pre-wrap text-center">
                {log.join('\n')}
            </div>
          ) : (
            <div className="space-y-3">
                {formatLog(log)}
                {hintMessages && hintMessages.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-dashed border-bunker-300 dark:border-bunker-600 text-amber-600 dark:text-amber-400">
                        <strong>За довършване:</strong>
                        <ul className="list-disc pl-5 mt-1">
                            {hintMessages.map((msg, i) => <li key={i}>{msg}</li>)}
                        </ul>
                    </div>
                )}
            </div>
          )}
        </div>
        
        <div className="flex justify-center gap-4 pt-4">
          <Button onClick={onPrint} Icon={PrinterIcon} variant="secondary">Принтирай</Button>
          <Button onClick={onExport} Icon={DownloadIcon} variant="secondary">Експорт (.txt)</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Results;
