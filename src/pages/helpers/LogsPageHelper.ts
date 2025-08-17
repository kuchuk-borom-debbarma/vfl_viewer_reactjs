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

    // Flatten all log entries into a single array with level information
    const flattenLogEntries = (entries: LogEntry[], level: number = 0): Array<{ entry: LogEntry, level: number }> => {
        return _.flatMap(entries, (entry) => {
            const current = {entry, level};
            const children = _.isEmpty(entry.children)
                ? []
                : flattenLogEntries(entry.children, level + 1);
            return [current, ...children];
        });
    };

    const flatEntries = flattenLogEntries(processedLogs);

    // Group by level to calculate positions
    const entriesByLevel = _.groupBy(flatEntries, 'level');

    // Create nodes with better positioning
    return _.flatMap(entriesByLevel, (levelEntries, level) => {
        return _.map(levelEntries, (item, index) => ({
            id: item.entry.id,
            type: 'logNode',
            position: {
                x: index * 300,
                y: parseInt(level) * 180
            },
            data: item.entry
        }));
    });
};

// Create edges using flatMap approach
const createEdgesFromLogEntries = (logs: LogEntry[]): FlowEdge[] => {
    if (_.isEmpty(logs)) return [];

    // Collect all parent-child relationships using flatMap
    const collectRelationships = (entries: LogEntry[], parentId?: string): Array<{
        parentId: string,
        childId: string
    }> => {
        return _.flatMap(entries, (entry) => {
            const currentRelations = parentId ? [{parentId, childId: entry.id}] : [];
            const childRelations = _.isEmpty(entry.children)
                ? []
                : collectRelationships(entry.children, entry.id);

            return [...currentRelations, ...childRelations];
        });
    };

    const relationships = collectRelationships(logs);

    // Convert relationships to edges using map
    return _.map(relationships, (rel) => ({
        id: `${rel.parentId}-${rel.childId}`,
        source: rel.parentId,
        target: rel.childId
    }));
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