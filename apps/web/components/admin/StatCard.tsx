interface StatCardProps {
    icon: string;
    title: string;
    value: string | number;
    trend?: string;
    trendUp?: boolean;
}

export function StatCard({ icon, title, value, trend, trendUp }: StatCardProps) {
    return (
        <div className="card bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {value.toLocaleString()}
                    </p>
                    {trend && (
                        <p className={`text - xs font - medium ${trendUp !== false ? 'text-green-600' : 'text-red-600'} `}>
                            {trend}
                        </p>
                    )}
                </div>
                <div className="text-4xl opacity-20">{icon}</div>
            </div>
        </div>
    );
}
