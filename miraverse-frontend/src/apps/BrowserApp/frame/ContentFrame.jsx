import React from 'react';
import SearchHome from './SearchHome';
import SearchResults from './SearchResults';
import FaithMed from './portals/FaithMed';
import CyAcademy from './portals/CyAcademy';
import DGA from './portals/DGA';
import Library from './portals/Library';
import VectorNet from './portals/VectorNet';
import AurelineDaily from './portals/AurelineDaily';
import { Globe } from 'lucide-react';

export default function ContentFrame({ url, openTab, navigateTab }) {
    if (!url) return null;
    const stripped = url.replace(/^https?:\/\//, '');
    const domain = stripped.split('/')[0] || '';
    const path = stripped.substring(domain.length) || '/';

    if (domain === 'search.aure' || domain === '') {
        if (path.startsWith('/find?q=')) {
            const query = decodeURIComponent(path.split('q=')[1] || '');
            return <SearchResults query={query} navigateTab={navigateTab} />;
        }
        return <SearchHome openTab={openTab} navigateTab={navigateTab} />;
    }

    switch (domain) {
        case 'faithmed.aure':
            return <FaithMed navigateTab={navigateTab} />;
        case 'cyacademy.aure':
            return <CyAcademy />;
        case 'dga.gov.aure':
            return <DGA navigateTab={navigateTab} />;
        case 'library.aure':
            return <Library />;
        case 'vectornet.aure':
            return <VectorNet />;
        case 'aurelinedaily.aure':
            return <AurelineDaily />;
        default:
            return (
                <div className="flex h-full flex-col items-center justify-center text-slate-500">
                    <Globe className="h-16 w-16 mb-4 text-slate-300" />
                    <h2 className="text-2xl font-bold mb-2">Site Not Found</h2>
                    <p>The server could not be found.</p>
                </div>
            );
    }
}
