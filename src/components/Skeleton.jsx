import React from 'react'

/**
 * Skeleton loading component for better UX
 */
export function Skeleton({ className = '', variant = 'text' }) {
    const baseClass = 'animate-pulse bg-gray-700 rounded'
    
    const variants = {
        text: 'h-4 w-full',
        title: 'h-6 w-3/4',
        card: 'h-32 w-full',
        circle: 'h-10 w-10 rounded-full',
        button: 'h-10 w-24',
    }
    
    return (
        <div className={`${baseClass} ${variants[variant] || variants.text} ${className}`} />
    )
}

/**
 * Skeleton for concept/lesson cards
 */
export function CardSkeleton() {
    return (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-3 mb-3">
                <Skeleton variant="circle" />
                <div className="flex-1">
                    <Skeleton variant="title" className="mb-2" />
                    <Skeleton className="w-1/2" />
                </div>
            </div>
            <Skeleton className="mb-2" />
            <Skeleton className="w-2/3" />
            <div className="mt-4 flex gap-2">
                <Skeleton variant="button" />
                <Skeleton variant="button" />
            </div>
        </div>
    )
}

/**
 * Skeleton for dashboard grid
 */
export function DashboardSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <CardSkeleton key={i} />
            ))}
        </div>
    )
}

/**
 * Skeleton for lesson content
 */
export function LessonSkeleton() {
    return (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <Skeleton variant="title" className="mb-4" />
            <Skeleton className="mb-2" />
            <Skeleton className="mb-2" />
            <Skeleton className="w-3/4 mb-6" />
            
            <div className="space-y-4">
                <Skeleton variant="card" />
                <Skeleton variant="card" className="h-24" />
            </div>
            
            <div className="mt-6 flex gap-3">
                <Skeleton variant="button" className="w-32" />
                <Skeleton variant="button" className="w-32" />
            </div>
        </div>
    )
}

export default Skeleton

