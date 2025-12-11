/**
 * Production-ready Elasticsearch mapping configuration
 * This ensures consistency between code and actual index mapping
 */

export const POST_INDEX_MAPPING = {
    settings: {
        number_of_shards: 1,
        number_of_replicas: 0, // Set to 1+ in production
        analysis: {
            filter: {
                autocomplete_filter: {
                    type: 'edge_ngram',
                    min_gram: 2,
                    max_gram: 20,
                },
            },
            analyzer: {
                autocomplete: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: ['lowercase', 'autocomplete_filter'],
                },
                standard_lowercase: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: ['lowercase'],
                },
            },
        },
    },
    mappings: {
        properties: {
            // IDs - Always keyword for exact matching, filtering, and sorting
            id: { type: 'keyword' },
            userId: { type: 'keyword' },
            categoryId: { type: 'keyword' },
            locationId: { type: 'keyword' },
            zoneId: { type: 'keyword' },

            // Text fields - Searchable with keyword subfield for exact match and sorting
            title: {
                type: 'text',
                analyzer: 'autocomplete',
                search_analyzer: 'standard_lowercase',
                fields: {
                    keyword: { type: 'keyword' }, // For exact match, sorting, aggregations
                },
            },
            description: {
                type: 'text',
                analyzer: 'standard_lowercase',
            },

            // Numeric fields - For sorting and range queries
            price: { type: 'float' },
            viewCount: { type: 'integer' },

            // Enums/Status - Always keyword for filtering and sorting
            status: { type: 'keyword' },
            userIsActive: { type: 'boolean' },

            // Denormalized category data
            categoryName: {
                type: 'text',
                analyzer: 'autocomplete',
                search_analyzer: 'standard_lowercase',
                fields: {
                    keyword: { type: 'keyword' }, // For exact match, sorting
                },
            },
            categorySlug: { type: 'keyword' },

            // Denormalized location data - Keyword for filtering and sorting
            city: { type: 'keyword' },
            country: { type: 'keyword' },
            zoneName: { type: 'keyword' },

            // Arrays - Keyword for exact matching
            images: { type: 'keyword' },

            // Dates - For sorting and range queries
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' },

            // Autocomplete suggester
            suggest: {
                type: 'completion',
                contexts: [
                    {
                        name: 'category',
                        type: 'category',
                        path: 'categoryId',
                    },
                ],
            },
        },
    },
};

export const SEARCH_HISTORY_INDEX_MAPPING = {
    settings: {
        number_of_shards: 1,
        number_of_replicas: 0,
    },
    mappings: {
        properties: {
            userId: { type: 'keyword' },
            sessionId: { type: 'keyword' }, // For anonymous user tracking
            query: {
                type: 'text',
                fields: {
                    keyword: { type: 'keyword' }, // For aggregations
                },
            },
            categoryId: { type: 'keyword' },
            locationId: { type: 'keyword' },
            timestamp: { type: 'date' },
            resultCount: { type: 'integer' },
            clickedResults: { type: 'keyword' }, // Array of post IDs clicked
            dwellTime: { type: 'integer' }, // Time spent on results page in seconds
            converted: { type: 'boolean' }, // Whether user clicked on a product
            searchCount: { type: 'integer' }, // Number of times this search was performed
        },
    },
};

// Index naming strategy
export const INDEX_NAMES = {
    // Base index name (with version)
    POSTS_BASE: 'marketplace_posts',
    // Alias that points to current version (for zero-downtime migrations)
    POSTS_ALIAS: 'marketplace_posts',
    // Search history index
    SEARCH_HISTORY: 'marketplace_search_history',
};

// Current version - increment when mapping changes
export const CURRENT_POSTS_INDEX_VERSION = 2;

export function getPostsIndexName(): string {
    return `${INDEX_NAMES.POSTS_BASE}_v${CURRENT_POSTS_INDEX_VERSION}`;
}

