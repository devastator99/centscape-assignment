export function normalizeUrl(raw: string): string | null {
    try {
      const u = new URL(raw.trim());
      // lowercase host
      u.hostname = u.hostname.toLowerCase();
      // remove fragment
      u.hash = '';
      // remove utm_* query params
      const params = u.searchParams;
      const toDelete: string[] = [];
      params.forEach((v,k) => {
        if (k.toLowerCase().startsWith('utm_')) toDelete.push(k);
      });
      toDelete.forEach(k => params.delete(k));
      // sort params for stable order (optional)
      const entries = Array.from(params.entries()).sort();
      u.search = entries.length ? '?' + entries.map(e => `${encodeURIComponent(e[0])}=${encodeURIComponent(e[1])}`).join('&') : '';
      return u.toString();
    } catch {
      return null;
    }
  }
  