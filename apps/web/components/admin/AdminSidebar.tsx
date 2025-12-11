import {
    ChartBarIcon,
    UserGroupIcon,
    DocumentTextIcon,
    MegaphoneIcon,
    PaintBrushIcon,
    TagIcon,
    MapPinIcon,
    Squares2X2Icon,
    ShieldExclamationIcon,
    CreditCardIcon,
} from '@heroicons/react/24/outline';

interface AdminSidebarProps {
    activeView: string;
    onViewChange: (view: string) => void;
}

export function AdminSidebar({ activeView, onViewChange }: AdminSidebarProps) {
    const navItems = [
        { id: 'dashboard', Icon: ChartBarIcon, label: 'Dashboard' },
        { id: 'users', Icon: UserGroupIcon, label: 'Users' },
        { id: 'posts', Icon: DocumentTextIcon, label: 'Posts' },
        { id: 'categories', Icon: TagIcon, label: 'Categories' },
        { id: 'locations', Icon: MapPinIcon, label: 'Locations' },
        { id: 'zones', Icon: Squares2X2Icon, label: 'Zones' },
        { id: 'ads', Icon: MegaphoneIcon, label: 'Ads' },
        { id: 'blacklist', Icon: ShieldExclamationIcon, label: 'Blacklist' },
        { id: 'subscriptions', Icon: CreditCardIcon, label: 'Subscriptions' },
        { id: 'theme', Icon: PaintBrushIcon, label: 'Theme' },
    ];

    return (
        <aside className="w-64 bg-slate-900 dark:bg-slate-950 text-white flex flex-col h-screen sticky top-0 border-r border-slate-800">
            {/* Header */}
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-indigo-500 bg-clip-text text-transparent">
                    Admin Panel
                </h1>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Marketplace Management</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                {navItems.map((item) => {
                    const Icon = item.Icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${activeView === item.id
                                    ? 'bg-primary-600 dark:bg-primary-700 text-white shadow-lg'
                                    : 'text-slate-300 dark:text-slate-400 hover:bg-slate-800 dark:hover:bg-slate-900 hover:text-white'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800">
                <a
                    href="/"
                    className="flex items-center gap-2 text-slate-400 dark:text-slate-500 hover:text-white transition-colors"
                >
                    <span>←</span>
                    <span className="text-sm">Back to Marketplace</span>
                </a>
            </div>
        </aside>
    );
}
