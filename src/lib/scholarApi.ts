// Google Scholar API service using local backend proxy

export interface ScholarResult {
  position: number;
  title: string;
  result_id: string;
  link: string;
  snippet: string;
  publication_info: {
    summary: string;
    authors?: { name: string; link?: string }[];
  };
  resources?: {
    title: string;
    file_format: string;
    link: string;
  }[];
  inline_links?: {
    cited_by?: {
      total: number;
      link: string;
    };
    versions?: {
      total: number;
      link: string;
    };
  };
}

export interface ScholarResponse {
  search_metadata: {
    id: string;
    status: string;
    total_time_taken: number;
  };
  search_parameters: {
    q: string;
    hl: string;
  };
  organic_results: ScholarResult[];
}

export async function searchGoogleScholar(query: string, start: number = 0): Promise<ScholarResponse> {
  const params = new URLSearchParams({
    q: query,
    start: start.toString(),
  });

  const response = await fetch(`/api/scholar/search?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`SerpAPI error: ${response.statusText}`);
  }

  return response.json();
}

// Generate APA citation format
export function generateAPACitation(result: ScholarResult): string {
  const publicationInfo = result.publication_info?.summary || '';
  
  // Parse authors from publication info
  let authors = 'Unknown Author';
  let year = 'n.d.';
  let source = '';
  
  // Try to extract authors from the publication summary
  // Format is usually: "Author1, Author2 - Journal, Year - Publisher"
  const parts = publicationInfo.split(' - ');
  
  if (parts.length >= 1) {
    const authorPart = parts[0];
    // Format authors for APA (Last, F. I.)
    const authorNames = authorPart.split(', ').slice(0, 3);
    if (authorNames.length > 0) {
      authors = authorNames.map(name => {
        const nameParts = name.trim().split(' ');
        if (nameParts.length >= 2) {
          const lastName = nameParts[nameParts.length - 1];
          const initials = nameParts.slice(0, -1).map(n => n[0] + '.').join(' ');
          return `${lastName}, ${initials}`;
        }
        return name;
      }).join(', ');
      
      if (authorNames.length < authorPart.split(', ').length) {
        authors += ', et al.';
      }
    }
  }
  
  if (parts.length >= 2) {
    // Extract year from the second part
    const yearMatch = parts[1].match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      year = yearMatch[0];
    }
    source = parts[1].replace(/,?\s*\d{4}/, '').trim();
  }
  
  const title = result.title;
  
  // APA 7th Edition format
  return `${authors} (${year}). ${title}. ${source ? `*${source}*. ` : ''}${result.link}`;
}

// Generate MLA citation format
export function generateMLACitation(result: ScholarResult): string {
  const publicationInfo = result.publication_info?.summary || '';
  const parts = publicationInfo.split(' - ');
  
  let authors = 'Unknown Author';
  let source = '';
  let year = '';
  
  if (parts.length >= 1) {
    authors = parts[0];
  }
  
  if (parts.length >= 2) {
    const yearMatch = parts[1].match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      year = yearMatch[0];
    }
    source = parts[1].replace(/,?\s*\d{4}/, '').trim();
  }
  
  return `${authors}. "${result.title}." ${source ? `*${source}*, ` : ''}${year}. Web.`;
}

// Generate Chicago citation format
export function generateChicagoCitation(result: ScholarResult): string {
  const publicationInfo = result.publication_info?.summary || '';
  const parts = publicationInfo.split(' - ');
  
  let authors = 'Unknown Author';
  let source = '';
  let year = '';
  
  if (parts.length >= 1) {
    authors = parts[0];
  }
  
  if (parts.length >= 2) {
    const yearMatch = parts[1].match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      year = yearMatch[0];
    }
    source = parts[1].replace(/,?\s*\d{4}/, '').trim();
  }
  
  return `${authors}. "${result.title}." ${source ? `${source}, ` : ''}${year}. ${result.link}.`;
}
