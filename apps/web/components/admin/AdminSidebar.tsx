interface AdminSidebarProps {
    activeView: string;
    onViewChange: (view: string) => void;
}

export function AdminSidebar({ activeView, onViewChange }: AdminSidebarProps) {
    const navItems = [
        { id: 'dashboard', icon: '📊', label: 'Dashboard' },
        { id: 'users', icon: '👥', label: 'Users' },
        { id: 'posts', icon: '📝', label: 'Posts' },
        { id: 'ads', icon: '📢', label: 'Ads' },
        { id: 'theme', icon: '🎨', label: 'Theme' },
    ];

    return (
        <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen sticky top-0">
            {/* Header */}
            <div className="p-6 border-b border-gray-800">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Admin Panel
                </h1>
                <p className="text-xs text-gray-400 mt-1">Marketplace Management</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${activeView === item.id
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`}
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800">
                <a
                    href="/"
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <span>←</span>
                    <span className="text-sm">Back to Marketplace</span>
                </a>
            </div>
        </aside>
    );
}
