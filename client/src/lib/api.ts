// client/src/lib/api.ts
export const fetchData = async <T,>(url: string, method: string = "GET", body?: any): Promise<T | null> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    if (!token) {
        console.error("Authentication token missing.");
        if (typeof window !== 'undefined') {
            window.location.href = "/auth";
        }
        throw new Error("Authentication token missing. Please log in.");
    }

    try {
        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `${token}`,
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            if (response.status === 401 && typeof window !== 'undefined') {
                localStorage.removeItem("token");
                window.location.href = "/auth";
                throw new Error("Unauthorized. Please log in again.");
            }
            const errorBody = await response.text();
            try {
                const errData = JSON.parse(errorBody);
                throw new Error(errData.message || `API call failed with status ${response.status}`);
            } catch {
                throw new Error(`API call failed with status ${response.status}: ${errorBody}`);
            }
        }
        
        if (response.status === 204 || response.headers.get("Content-Length") === "0") {
            return null;
        }

        return await response.json();
    } catch (err: any) {
        console.error(`Network or API error fetching from ${url}: `, err);
        throw err;
    }
};
