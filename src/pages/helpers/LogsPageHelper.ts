import {LogEntry} from "../../api/vfl";
import _ from "lodash";

export type FlowNode = {
    id: string;
    type: string;
    position: { x: number; y: number };
    data: LogEntry;
};

export type FlowEdge = {
    id: string;
    source: string;
    target: string;
};

const mutateSiblingCursor = (logs: LogEntry[]): LogEntry[] => {
    if (!logs || logs.length === 0) {
        return [];
    }

    return logs.map((value, index) => {
        // Only keep siblingCursor for the last sibling in this level
        if (index < logs.length - 1) {
            value.siblingCursor = null;
        }

        // Recursively process children if they exist
        if (value.children && value.children.length > 0) {
            value.children = mutateSiblingCursor(value.children);
        }

        return value;
    });
}

const mutateChildrenCursor = (logs: LogEntry[]): LogEntry[] => {
    if (!logs || logs.length === 0) {
        return [];
    }

    return logs.map((value) => {
        if (value.children && value.children.length > 0) {
            // This node has children, so it's not a leaf - set childrenCursor to null
            value.childrenCursor = null;
            // Recursively process children
            value.children = mutateChildrenCursor(value.children);
        }
        // If no children, this is a leaf node - keep childrenCursor as is (don't modify it)

        return value;
    });
}

// Create nodes from log entries using flatMap approach
const createNodesFromLogEntries = (logs: LogEntry[]): FlowNode[] => {
    if (_.isEmpty(logs)) return [];

    // Create a deep copy to avoid mutating the original data
    const logsCopy = _.cloneDeep(logs);

    // Apply cursor mutations
    const processedLogs = mutateChildrenCursor(mutateSiblingCursor(logsCopy));

    // Flatten all log entries into a single array
    const flattenLogEntries = (entries: LogEntry[]): LogEntry[] => {
        return _.flatMap(entries, (entry) => {
            const children = _.isEmpty(entry.children) ? [] : flattenLogEntries(entry.children);
            return [entry, ...children];
        });
    };

    const flatEntries = flattenLogEntries(processedLogs);

    // Create nodes with simple positioning (will be overridden by layout)
    return _.map(flatEntries, (entry, index) => ({
        id: entry.id,
        type: 'logNode',
        position: {
            x: index * 300,
            y: 0
        },
        data: entry
    }));
};

// Create edges based PURELY on parentLogId - NO dependency on children array
const createEdgesFromLogEntries = (logs: LogEntry[]): FlowEdge[] => {
    if (_.isEmpty(logs)) return [];

    // Flatten all log entries first
    const flattenLogEntries = (entries: LogEntry[]): LogEntry[] => {
        return _.flatMap(entries, (entry) => {
            const children = _.isEmpty(entry.children) ? [] : flattenLogEntries(entry.children);
            return [entry, ...children];
        });
    };

    const allEntries = flattenLogEntries(logs);

    // Create edges based ONLY on parentLogId field
    const edges = _.compact(_.map(allEntries, (entry) => {
        if (!entry.parentLogId) {
            // This is a root node, no edge needed
            return null;
        }

        return {
            id: `${entry.parentLogId}-${entry.id}`,
            source: entry.parentLogId,
            target: entry.id
        };
    }));

    return _.uniqBy(edges, 'id');
};

export const createFlowFromLogEntries = (logs: LogEntry[]): { nodes: FlowNode[], edges: FlowEdge[] } => {
    if (_.isEmpty(logs)) {
        return {nodes: [], edges: []};
    }

    const nodes = createNodesFromLogEntries(logs);
    const edges = createEdgesFromLogEntries(logs);

    return {
        nodes: _.uniqBy(nodes, 'id'),
        edges: _.uniqBy(edges, 'id')
    };
};