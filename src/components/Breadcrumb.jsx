import React from 'react'

/**
 * Breadcrumb navigation component
 * Shows the current location in the app hierarchy
 */
export default function Breadcrumb({ items = [], onNavigate }) {
    if (items.length === 0) return null

    return (
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-4 overflow-x-auto pb-2">
            <span className="text-gray-500">📍</span>
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {index > 0 && <span className="text-gray-600">/</span>}
                    {item.onClick ? (
                        <button
                            onClick={item.onClick}
                            className="hover:text-blue-400 transition-colors whitespace-nowrap"
                        >
                            {item.icon && <span className="mr-1">{item.icon}</span>}
                            {item.label}
                        </button>
                    ) : (
                        <span className={`whitespace-nowrap ${index === items.length - 1 ? 'text-white font-medium' : ''}`}>
                            {item.icon && <span className="mr-1">{item.icon}</span>}
                            {item.label}
                        </span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    )
}

/**
 * Helper to build breadcrumb items for common scenarios
 */
export function buildBreadcrumbs(location) {
    const crumbs = [
        { label: 'Dashboard', icon: '🏠' }
    ]

    if (location.concept) {
        crumbs.push({ label: location.concept, icon: '📚' })
    }

    if (location.lesson) {
        crumbs.push({ label: location.lesson, icon: '📖' })
    }

    if (location.quiz) {
        crumbs.push({ label: 'Quiz', icon: '📝' })
    }

    return crumbs
}

