import { useMutation } from '@tanstack/react-query';

export function useRecommendShoes() {
    return useMutation({
        mutationFn: async (profile) => {
            const res = await fetch('/api/recommend-shoes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
                body: JSON.stringify(profile),
            });
            if (!res.ok) throw new Error('Failed to fetch recommendations');
            return res.json();
        }
    });
}