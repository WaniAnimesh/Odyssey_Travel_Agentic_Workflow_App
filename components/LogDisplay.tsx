
import React, { useEffect, useRef } from 'react';

interface LogDisplayProps {
    logs: string[];
}

const LogDisplay: React.FC<LogDisplayProps> = ({ logs }) => {
    const endOfLogsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfLogsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="mt-8 bg-black/50 p-4 rounded-lg border border-gray-700 max-h-96 overflow-y-auto font-mono text-sm">
            <div className="flex items-center mb-2">
                <span className="h-3 w-3 rounded-full bg-red-500 mr-2"></span>
                <span className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></span>
                <span className="h-3 w-3 rounded-full bg-green-500"></span>
                <span className="ml-4 text-gray-400">Workflow Logs</span>
            </div>
            <div className="text-gray-300 whitespace-pre-wrap">
                {logs.map((log, index) => (
                    <p key={index} className="leading-relaxed">
                        <span className="text-purple-400 mr-2">{`> `}</span>
                        {log}
                    </p>
                ))}
                <div ref={endOfLogsRef} />
            </div>
        </div>
    );
};

export default LogDisplay;
