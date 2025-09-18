# VFL Frontend Viewer Documentation

## Overview

The VFL Frontend Viewer is a React-based web application that provides an interactive interface for exploring hierarchical execution logs from the Visual Flow Logger system. It transforms complex execution traces into intuitive visual representations with drag-and-zoom navigation, collapsible hierarchies, and detailed timing analysis.

## Architecture

### Technology Stack

- **React 18** with TypeScript for type safety
- **React Router** for client-side navigation
- **Tailwind CSS** for responsive styling
- **Vite** as build tool (inferred from JSX structure)

### Core Components

```
src/
├── components/           # Reusable UI components
│   ├── UI/              # Basic UI elements (Button, Card, Badge)
│   ├── Layout/          # Layout components (Header, Sidebar, Viewport)
│   ├── Logs/            # Log-specific components (LogTree, LogCard)
│   └── Controls/        # Interaction controls
├── pages/               # Route components
├── hooks/               # Custom React hooks
├── api/                 # Backend integration
├── types/               # TypeScript definitions
└── utils/               # Helper functions
```

## Getting Started

### Configuration

The application connects to the VFL Hub backend through configuration in `src/config/constants.ts`:

```typescript
export const CONFIG = {
    API_HOST: "http://localhost:8080",
    API_VERSION: "v1",
    DEFAULT_PAGE_SIZE: 10,
    MAX_ZOOM: 3,
    MIN_ZOOM: 0.1,
    ZOOM_STEP: 0.001,
} as const;
```

### Environment Setup

1. Ensure VFL Hub backend is running on the configured host
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Navigate to `http://localhost:3000`

## User Interface

### Landing Page (`/`)

The entry point showcasing VFL capabilities with:
- **Hero section** explaining hierarchical logging benefits
- **Comparison view** traditional vs VFL logging approaches
- **Feature highlights** with interactive examples
- **Call-to-action** directing users to explore operations

**Key Features:**
- Responsive design for all screen sizes
- Clear value proposition with visual comparisons
- Educational content about execution flow visualization

### Operations Dashboard (`/operations`)

Lists all root execution blocks with pagination:

```typescript
// URL pattern with cursor-based pagination
/operations?cursor=<encoded_cursor>
```

**Features:**
- **Card-based layout** showing block summaries
- **Status indicators** (Running/Complete)
- **Timing information** (start time, duration, end time)
- **Pagination controls** with browser history integration
- **Search and filtering** (planned enhancement)

**Block Card Information:**
- Block name and truncated ID
- Execution status with color coding
- Start/end timestamps
- Duration calculation
- End messages (if available)

### Log Viewer (`/logs/:blockId`)

The primary interface for exploring execution hierarchies:

#### Layout Components

**Header Bar:**
- Back navigation with context preservation
- Block information (name, ID)
- Sidebar toggle
- Zoom controls (in/out/reset/percentage)
- View controls (expand all/collapse all)
- Input mode selection (mouse/trackpad)

**Sidebar Panel:**
- Block details (name, ID, timestamps)
- Execution status and duration
- End messages
- Usage hints and keyboard shortcuts
- Collapsible with overlay for mobile

**Main Viewport:**
- Infinite canvas with pan and zoom
- Hierarchical log tree visualization
- Referenced block navigation
- Smooth animations and transitions

#### Interaction Model

**Navigation:**
- **Pan:** Click and drag empty space
- **Zoom:** Mouse wheel (Ctrl+wheel for precision)
- **Trackpad mode:** Native trackpad gestures
- **Reset:** Double-click or reset button

**Log Exploration:**
- **Expand/Collapse:** Click arrow icons on referenced blocks
- **Details:** Click log cards for expanded information
- **Navigate:** Click referenced block cards to jump to new view
- **Load More:** Pagination buttons for large datasets

## Data Model

### Block Structure

```typescript
interface Block {
    id: string;              // Unique identifier
    name: string;            // Human-readable name
    createdAt: number;       // Creation timestamp
    enteredAt: number | null; // Execution start
    exitedAt: number | null;  // Execution end
    returnedAt: number | null; // Completion timestamp
    exitMessage: string | null; // End message
    cursor: string;          // Pagination cursor
    // Computed properties
    startTime: number;       // Effective start time
    endTime: number | null;  // Effective end time
    endMessage: string | null; // Effective end message
}
```

### Log Entry Structure

```typescript
interface LogEntry {
    id: string;              // Unique log ID
    blockId: string;         // Parent block ID
    parentLogId?: string | null; // Sequential parent
    message: string | null;  // Log message content
    referencedBlock: Block | null; // Referenced block (for hierarchical logs)
    timestamp: number;       // Log timestamp
    logType: LogType;        // Log classification
    cursor: string;          // Pagination cursor
    children?: LogEntry[];   // Computed children (for tree building)
}
```

### Log Types

```typescript
enum LogType {
    // Basic logging levels
    INFO = "INFO",
    WARN = "WARN", 
    ERROR = "ERROR",
    
    // Execution flow types
    TRACE_PRIMARY = "TRACE_PRIMARY",           // Sequential sub-block
    TRACE_PARALLEL_JOIN = "TRACE_PARALLEL_JOIN", // Parallel operation join
    TRACE_PARALLEL = "TRACE_PARALLEL",         // Parallel operation
    TRACE_REMOTE = "TRACE_REMOTE",             // Remote service call
    PUBLISH_EVENT = "PUBLISH_EVENT",           // Event publishing
    LISTEN_EVENT = "LISTEN_EVENT"              // Event consumption
}
```

## Visualization Features

### Hierarchical Tree Rendering

The LogTree component builds execution hierarchies using parent-child relationships:

**Tree Building Algorithm:**
1. Create parent-child map using `parentLogId` field
2. Render logs in chronological order within each level
3. Handle referenced blocks as expandable nested trees
4. Display parallel operations in side-by-side layout

**Visual Elements:**
- **Log Cards:** Color-coded by type with symbols and timestamps
- **Nesting:** Indentation and connection lines show hierarchy
- **Parallel Sections:** Horizontal layout for concurrent operations
- **Referenced Blocks:** Expandable panels with lazy loading

### Interactive Features

**Collapsible Hierarchies:**
- Referenced blocks start collapsed
- Click expansion controls to reveal nested content
- Global expand/collapse all functionality
- State preservation during navigation

**Detailed Views:**
- Click log cards for expanded details
- Show full message content, timing, and metadata
- Referenced block previews with navigation links
- Contextual information based on log type

**Performance Optimization:**
- Lazy loading of referenced block content
- Cursor-based pagination for large datasets
- Virtual scrolling for performance (planned)
- Efficient re-renders with React.memo

## Timing Analysis

### Duration Calculations

The viewer provides comprehensive timing analysis:

**Relative Timing:**
- Duration between sequential log entries
- Parallel operation timing comparison
- Block execution duration calculation
- Real-time updates for ongoing operations

**Display Formats:**
```typescript
// Duration formatting examples
formatDuration(startTime, endTime) // "2m 15s", "450ms", "1h 5m 30s"
calculateDuration(log, parentTimestamp) // "+150ms", "+2s", "N/A"
```

**Visual Indicators:**
- Timeline position relative to parent
- Duration badges on log cards
- Progress indicators for running operations
- Color coding for performance patterns

## API Integration

### Backend Communication

The frontend communicates with VFL Hub through REST endpoints:

```typescript
// API endpoints
GET /api/v1/blocks?limit=10&cursor=xyz     // List root blocks
GET /api/v1/block/{blockId}                // Get specific block
GET /api/v1/logs/{blockId}?limit=10&cursor=xyz // Get block logs
```

**Request/Response Handling:**
- Automatic error handling with user-friendly messages
- Loading states for all async operations
- Retry logic for failed requests
- Debug logging for development

**Data Transformation:**
- Backend data transformed to frontend interfaces
- Cursor-based pagination handling
- Referenced block resolution and caching
- Type-safe API calls with TypeScript

### Caching and State Management

**Local State:**
- React hooks for component-specific state
- Context-free architecture for simplicity
- Efficient re-renders with dependency arrays

**Data Caching:**
- Referenced block data cached in memory
- Pagination cursor management
- Browser navigation state preservation
- No localStorage usage (session-based only)

## Custom Hooks

### useLogs Hook

Manages log data and interactions for a specific block:

```typescript
const {
    block,                    // Block details
    allLogs,                  // All loaded logs
    loading,                  // Initial load state
    loadingMore,              // Pagination load state
    error,                    // Error messages
    hasMore,                  // Pagination availability
    collapsed,                // Collapsed state set
    loadingReferenced,        // Referenced block load states
    referencedBlockData,      // Cached referenced data
    loadMore,                 // Load more logs function
    loadReferencedBlock,      // Load referenced block function
    expandAll,                // Expand all function
    collapseAll,              // Collapse all function
} = useLogs(blockId);
```

### useViewport Hook

Handles canvas navigation and zoom controls:

```typescript
const {
    viewState,           // Current view state (zoom, pan, drag)
    inputMode,           // Mouse or trackpad mode
    updateZoom,          // Zoom modification function
    updatePan,           // Pan modification function
    startDrag,           // Drag start handler
    updateDrag,          // Drag update handler
    endDrag,             // Drag end handler
    resetView,           // Reset to default view
    zoomIn,              // Zoom in function
    zoomOut,             // Zoom out function
} = useViewport();
```

### usePagination Hook

Generic pagination management:

```typescript
const {
    items,               // Current items
    loading,             // Loading state
    error,               // Error state
    hasMore,             // More items available
    loadMore,            // Load more function
    refresh,             // Refresh function
} = usePagination({
    fetchFn: getRootBlocks,
    pageSize: 10,
    autoLoad: true
});
```

## Responsive Design

### Screen Adaptations

**Desktop (>1024px):**
- Full sidebar with detailed information
- Multi-column layout for operations
- Rich hover interactions
- Keyboard shortcuts

**Tablet (768px-1024px):**
- Collapsible sidebar with overlay
- Grid layouts adapt to screen width
- Touch-friendly controls
- Optimized for both portrait/landscape

**Mobile (<768px):**
- Compact header with essential controls
- Single-column layouts
- Touch gestures for navigation
- Simplified information density

### Accessibility Features

**Keyboard Navigation:**
- Tab order through interactive elements
- Enter/Space activation for buttons
- Arrow key navigation (planned)
- Focus indicators

**Screen Reader Support:**
- Semantic HTML structure
- ARIA labels for complex interactions
- Alternative text for visual elements
- Descriptive button labels

**Visual Accessibility:**
- High contrast color schemes
- Scalable font sizes
- Clear visual hierarchy
- Consistent interaction patterns

## Performance Considerations

### Optimization Strategies

**Rendering Performance:**
- React.memo for expensive components
- useMemo/useCallback for computed values
- Efficient dependency arrays
- Minimal re-renders

**Data Loading:**
- Cursor-based pagination for large datasets
- Lazy loading of referenced blocks
- Incremental data fetching
- Request deduplication

**Memory Management:**
- Cleanup of event listeners
- Efficient state updates
- Garbage collection friendly patterns
- No memory leaks in useEffect

### Scalability

**Large Datasets:**
- Virtual scrolling for massive logs (roadmap)
- Chunked data loading
- Progressive enhancement
- Search and filtering optimization

**Network Optimization:**
- Request batching where possible
- Compression support
- CDN-friendly static assets
- Efficient bundle splitting

## Customization and Theming

### Visual Customization

**Color Scheme:**
```css
:root {
    --primary: #3b82f6;
    --primary-dark: #1d4ed8;
}
```

**Log Type Colors:**
```typescript
export const LOG_COLORS = {
    INFO: '#6b7280',
    WARN: '#f59e0b', 
    ERROR: '#ef4444',
    TRACE_PRIMARY: '#10b981',
    // ... more colors
} as const;
```

**Symbols and Icons:**
```typescript
export const LOG_SYMBOLS = {
    INFO: "ℹ️",
    WARN: "⚠️",
    ERROR: "❌", 
    TRACE_PRIMARY: "▶️",
    // ... more symbols
} as const;
```

### Component Customization

**UI Components:**
- Consistent design system with variants
- Configurable sizes and styles
- Theme-aware color schemes
- Extensible component props

**Layout Components:**
- Configurable sidebar width
- Adjustable zoom limits
- Customizable page sizes
- Flexible grid layouts

## Development Guidelines

### Code Organization

**Component Structure:**
```typescript
// Component template
export const ComponentName: React.FC<ComponentProps> = ({
    prop1,
    prop2,
    onAction
}) => {
    // Hooks at the top
    const [state, setState] = useState();
    
    // Event handlers
    const handleClick = useCallback(() => {
        // Handler logic
    }, [dependencies]);
    
    // Render
    return (
        <div className="component-styles">
            {/* JSX content */}
        </div>
    );
};
```

**Custom Hook Pattern:**
```typescript
export const useCustomHook = (param: string) => {
    const [state, setState] = useState();
    
    const action = useCallback(async () => {
        // Async logic
    }, [dependencies]);
    
    useEffect(() => {
        // Side effects
    }, [dependencies]);
    
    return {
        state,
        action,
        // Other returns
    };
};
```

### Best Practices

**State Management:**
- Keep state as close to usage as possible
- Use custom hooks for complex state logic
- Prefer composition over prop drilling
- Avoid unnecessary global state

**Performance:**
- Memoize expensive calculations
- Use proper dependency arrays
- Implement loading states
- Handle error boundaries

**Type Safety:**
- Define explicit interfaces
- Use discriminated unions for variants
- Prefer specific types over any
- Implement proper error types

## Deployment

### Build Process

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Environment Variables

```bash
# .env.production
VITE_API_HOST=https://your-vfl-hub.com
VITE_API_VERSION=v1
```

### Static Hosting

The built application is a static SPA suitable for:
- **Nginx** with proper routing configuration
- **CDN deployment** (Cloudflare, AWS CloudFront)
- **Container deployment** with reverse proxy
- **GitHub Pages** or similar static hosts

### Configuration

```nginx
# nginx.conf for SPA routing
location / {
    try_files $uri $uri/ /index.html;
}
```

## Troubleshooting

### Common Issues

**API Connection:**
- Verify VFL Hub is running and accessible
- Check CORS configuration for cross-origin requests
- Validate API endpoints and response formats
- Monitor browser network tab for failed requests

**Performance Issues:**
- Check for memory leaks in development tools
- Monitor component re-render frequency
- Validate efficient dependency arrays
- Profile large dataset rendering

**Navigation Problems:**
- Verify React Router configuration
- Check browser history state
- Validate URL parameter parsing
- Test back/forward button behavior

### Debug Features

**Development Mode:**
- Console logging for API requests/responses
- React Developer Tools compatibility
- Hot module replacement
- Error boundary reporting

**Production Monitoring:**
- Error tracking integration points
- Performance monitoring hooks
- User interaction analytics
- Network request monitoring

## Future Enhancements

### Planned Features

**Search and Filtering:**
- Full-text search across log messages
- Filter by log type, time range, and block
- Saved search queries
- Advanced query syntax

**Export Capabilities:**
- Export execution flows as images
- Generate PDF reports
- JSON/CSV data export
- Shareable links for specific views

**Real-time Updates:**
- WebSocket integration for live logs
- Progressive enhancement for streaming
- Notification system for important events
- Auto-refresh for ongoing operations

**Advanced Visualization:**
- Timeline view with Gantt chart style
- Performance heatmaps
- Execution pattern analysis
- Custom visualization plugins

### Integration Opportunities

**Development Tools:**
- IDE plugin integration
- CI/CD pipeline visualization
- Performance regression detection
- Automated flow documentation

**Monitoring Integration:**
- APM tool connectivity
- Alerting system integration
- Metrics dashboard embedding
- Distributed tracing correlation

This documentation provides a comprehensive guide to the VFL Frontend Viewer, covering architecture, usage, development, and deployment aspects for both users and developers working with the system.