import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { motion, AnimatePresence } from 'framer-motion'
import { GitFork, ZoomIn, ZoomOut, RotateCcw, Filter, X, Info } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { nodeTypeColor, cn } from '@/lib/utils'
import type { GraphNode, GraphEdge, KnowledgeGraph } from '@/types'

// ─── Demo graph data ──────────────────────────────────────────────────────────
const DEMO_GRAPH: KnowledgeGraph = {
  lastUpdated: new Date().toISOString(),
  nodes: [
    { id: 'n1',  label: 'Transformers',          type: 'topic',    weight: 9, documentIds: ['doc-1','doc-2'] },
    { id: 'n2',  label: 'Self-Attention',         type: 'concept',  weight: 8, documentIds: ['doc-2'] },
    { id: 'n3',  label: 'Neural Networks',        type: 'topic',    weight: 7, documentIds: ['doc-1'] },
    { id: 'n4',  label: 'RAG Pipeline',           type: 'concept',  weight: 8, documentIds: ['doc-3'] },
    { id: 'n5',  label: 'Embeddings',             type: 'concept',  weight: 7, documentIds: ['doc-3'] },
    { id: 'n6',  label: 'Vector Database',        type: 'entity',   weight: 6, documentIds: ['doc-3','doc-5'] },
    { id: 'n7',  label: 'Attention Is All You Need', type: 'document', weight: 5, documentIds: ['doc-2'] },
    { id: 'n8',  label: 'BERT',                   type: 'entity',   weight: 5, documentIds: ['doc-1'] },
    { id: 'n9',  label: 'GPT',                    type: 'entity',   weight: 5, documentIds: ['doc-1'] },
    { id: 'n10', label: 'LLM',                    type: 'topic',    weight: 8, documentIds: ['doc-3'] },
    { id: 'n11', label: 'Semantic Search',        type: 'concept',  weight: 6, documentIds: ['doc-3'] },
    { id: 'n12', label: 'Multi-Head Attention',   type: 'concept',  weight: 6, documentIds: ['doc-2'] },
    { id: 'n13', label: 'Backpropagation',        type: 'concept',  weight: 4, documentIds: ['doc-1'] },
    { id: 'n14', label: 'Qdrant',                 type: 'entity',   weight: 4, documentIds: ['doc-5'] },
    { id: 'n15', label: 'Pinecone',               type: 'entity',   weight: 4, documentIds: ['doc-5'] },
    { id: 'n16', label: 'Fine-tuning',            type: 'concept',  weight: 5, documentIds: ['doc-3'] },
    { id: 'n17', label: 'Positional Encoding',    type: 'concept',  weight: 4, documentIds: ['doc-2'] },
    { id: 'n18', label: 'Feed-Forward Network',   type: 'concept',  weight: 4, documentIds: ['doc-2'] },
  ],
  edges: [
    { id: 'e1',  source: 'n1',  target: 'n2',  weight: 9, type: 'contains' },
    { id: 'e2',  source: 'n1',  target: 'n12', weight: 8, type: 'contains' },
    { id: 'e3',  source: 'n1',  target: 'n17', weight: 7, type: 'contains' },
    { id: 'e4',  source: 'n1',  target: 'n18', weight: 7, type: 'contains' },
    { id: 'e5',  source: 'n7',  target: 'n1',  weight: 9, type: 'references' },
    { id: 'e6',  source: 'n3',  target: 'n13', weight: 7, type: 'contains' },
    { id: 'e7',  source: 'n1',  target: 'n3',  weight: 8, type: 'related' },
    { id: 'e8',  source: 'n3',  target: 'n8',  weight: 6, type: 'derived_from' },
    { id: 'e9',  source: 'n3',  target: 'n9',  weight: 6, type: 'derived_from' },
    { id: 'e10', source: 'n4',  target: 'n5',  weight: 9, type: 'contains' },
    { id: 'e11', source: 'n4',  target: 'n6',  weight: 8, type: 'contains' },
    { id: 'e12', source: 'n4',  target: 'n11', weight: 8, type: 'contains' },
    { id: 'e13', source: 'n5',  target: 'n1',  weight: 7, type: 'related' },
    { id: 'e14', source: 'n10', target: 'n4',  weight: 8, type: 'related' },
    { id: 'e15', source: 'n10', target: 'n16', weight: 6, type: 'related' },
    { id: 'e16', source: 'n6',  target: 'n14', weight: 7, type: 'contains' },
    { id: 'e17', source: 'n6',  target: 'n15', weight: 7, type: 'contains' },
    { id: 'e18', source: 'n2',  target: 'n12', weight: 8, type: 'related' },
    { id: 'e19', source: 'n10', target: 'n1',  weight: 7, type: 'related' },
  ],
}

// ─── Node detail panel ────────────────────────────────────────────────────────

function NodePanel({ node, onClose }: { node: GraphNode; onClose: () => void }) {
  const { documents } = useStore()
  const relatedDocs = documents.filter((d) => node.documentIds.includes(d.id))

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-4 right-4 w-64 glass rounded-xl p-4 z-10 shadow-panel"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <span
            className="node-chip mb-1 inline-block"
            style={{
              background: nodeTypeColor(node.type) + '20',
              color: nodeTypeColor(node.type),
              border: `1px solid ${nodeTypeColor(node.type)}40`,
            }}
          >
            {node.type}
          </span>
          <h3 className="font-display font-semibold text-sm text-text-primary mt-1">{node.label}</h3>
        </div>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted font-mono">Weight</span>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-16 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-cyan"
                style={{ width: `${(node.weight / 10) * 100}%` }}
              />
            </div>
            <span className="text-text-secondary font-mono">{node.weight}/10</span>
          </div>
        </div>

        {relatedDocs.length > 0 && (
          <div>
            <p className="text-2xs text-text-muted font-mono uppercase tracking-widest mb-1.5">
              Found in
            </p>
            <div className="space-y-1">
              {relatedDocs.map((doc) => (
                <div key={doc.id} className="text-xs text-text-secondary bg-surface/50 rounded-md px-2 py-1.5 truncate">
                  {doc.title}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Legend ───────────────────────────────────────────────────────────────────

const NODE_TYPES = [
  { type: 'concept',  label: 'Concept' },
  { type: 'document', label: 'Document' },
  { type: 'entity',   label: 'Entity' },
  { type: 'topic',    label: 'Topic' },
] as const

// ─── Main GraphView ───────────────────────────────────────────────────────────

export function GraphView() {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphEdge> | null>(null)
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)

  const { graph, setGraph, selectedNodeId, setSelectedNodeId, graphFilters, setGraphFilters } = useStore()

  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)

  // Load demo graph
  useEffect(() => {
    if (!graph) setGraph(DEMO_GRAPH)
  }, [graph, setGraph])

  const activeGraph = graph ?? DEMO_GRAPH

  // Filter nodes
  const filteredNodes = activeGraph.nodes.filter((n) => {
    if (!graphFilters.nodeTypes.includes(n.type)) return false
    if (n.weight < graphFilters.minWeight) return false
    if (graphFilters.searchQuery) {
      return n.label.toLowerCase().includes(graphFilters.searchQuery.toLowerCase())
    }
    return true
  })
  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id))
  const filteredEdges = activeGraph.edges.filter(
    (e) => filteredNodeIds.has(e.source as string) && filteredNodeIds.has(e.target as string)
  )

  const buildGraph = useCallback(() => {
    const svg = svgRef.current
    const container = containerRef.current
    if (!svg || !container) return

    const W = container.clientWidth
    const H = container.clientHeight

    d3.select(svg).selectAll('*').remove()

    const svgEl = d3.select(svg)
      .attr('width', W)
      .attr('height', H)

    // Zoom
    const g = svgEl.append('g')
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => g.attr('transform', event.transform))
    svgEl.call(zoom)
    zoomRef.current = zoom

    // Defs — glow filter
    const defs = svgEl.append('defs')
    const filter = defs.append('filter').attr('id', 'glow')
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur')
    const merge = filter.append('feMerge')
    merge.append('feMergeNode').attr('in', 'coloredBlur')
    merge.append('feMergeNode').attr('in', 'SourceGraphic')

    // Clone data for simulation mutation
    const nodes: GraphNode[] = filteredNodes.map((n) => ({ ...n, x: W / 2, y: H / 2 }))
    const edges: GraphEdge[] = filteredEdges.map((e) => ({ ...e }))

    // Simulation
    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges)
        .id((d: unknown) => (d as GraphNode).id)
        .distance((e: unknown) => 80 + (10 - (e as GraphEdge).weight) * 8)
        .strength(0.4))
      .force('charge', d3.forceManyBody().strength(-220))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collide', d3.forceCollide((d: unknown) => (d as GraphNode).weight * 4 + 12))

    simulationRef.current = sim

    // Edges
    const edgeGroup = g.append('g').attr('class', 'edges')
    const link = edgeGroup.selectAll('line')
      .data(edges)
      .enter()
      .append('line')
      .attr('stroke', (e: GraphEdge) => {
        const src = nodes.find((n) => n.id === (e.source as unknown as GraphNode).id || n.id === e.source)
        return src ? nodeTypeColor(src.type) + '40' : '#1e3a6a'
      })
      .attr('stroke-width', (e: GraphEdge) => Math.max(0.5, e.weight * 0.2))
      .attr('stroke-dasharray', (e: GraphEdge) => e.type === 'references' ? '4,3' : 'none')

    // Node groups
    const nodeGroup = g.append('g').attr('class', 'nodes')
    const nodeEl = nodeGroup.selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) sim.alphaTarget(0.3).restart()
            d.fx = d.x; d.fy = d.y
          })
          .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y })
          .on('end', (event, d) => {
            if (!event.active) sim.alphaTarget(0)
            d.fx = null; d.fy = null
          })
      )
      .on('click', (_event, d: GraphNode) => {
        setSelectedNode(d)
        setSelectedNodeId(d.id)
      })
      .on('mouseenter', (_event, d: GraphNode) => setHoveredNode(d.id))
      .on('mouseleave', () => setHoveredNode(null))

    // Node circles
    nodeEl.append('circle')
      .attr('r', (d: GraphNode) => d.weight * 2.5 + 6)
      .attr('fill', (d: GraphNode) => nodeTypeColor(d.type) + '22')
      .attr('stroke', (d: GraphNode) => nodeTypeColor(d.type))
      .attr('stroke-width', 1.5)
      .attr('filter', 'url(#glow)')

    // Inner dot
    nodeEl.append('circle')
      .attr('r', (d: GraphNode) => d.weight * 1.0 + 2)
      .attr('fill', (d: GraphNode) => nodeTypeColor(d.type))
      .attr('opacity', 0.8)

    // Labels
    nodeEl.append('text')
      .text((d: GraphNode) => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', (d: GraphNode) => d.weight * 2.5 + 18)
      .attr('font-size', '10px')
      .attr('font-family', 'DM Sans, sans-serif')
      .attr('fill', '#94a3b8')
      .attr('pointer-events', 'none')

    // Tick
    sim.on('tick', () => {
      link
        .attr('x1', (e: unknown) => ((e as { source: GraphNode }).source.x ?? 0))
        .attr('y1', (e: unknown) => ((e as { source: GraphNode }).source.y ?? 0))
        .attr('x2', (e: unknown) => ((e as { target: GraphNode }).target.x ?? 0))
        .attr('y2', (e: unknown) => ((e as { target: GraphNode }).target.y ?? 0))

      nodeEl.attr('transform', (d: GraphNode) => `translate(${d.x ?? 0},${d.y ?? 0})`)
    })
  }, [filteredNodes, filteredEdges, setSelectedNodeId])

  useEffect(() => {
    buildGraph()
    return () => { simulationRef.current?.stop() }
  }, [buildGraph])

  const handleZoomIn = () => {
    if (!svgRef.current || !zoomRef.current) return
    d3.select(svgRef.current).transition().call(zoomRef.current.scaleBy, 1.4)
  }

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomRef.current) return
    d3.select(svgRef.current).transition().call(zoomRef.current.scaleBy, 0.7)
  }

  const handleReset = () => {
    if (!svgRef.current || !zoomRef.current) return
    d3.select(svgRef.current).transition().call(zoomRef.current.transform, d3.zoomIdentity)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0 glass">
        <div className="flex items-center gap-2">
          <GitFork className="w-4 h-4 text-cyan" />
          <h1 className="font-display font-semibold text-sm text-text-primary">Knowledge Graph</h1>
          <span className="text-2xs font-mono text-text-muted">
            {filteredNodes.length} nodes · {filteredEdges.length} edges
          </span>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search nodes…"
          value={graphFilters.searchQuery}
          onChange={(e) => setGraphFilters({ searchQuery: e.target.value })}
          className="neural-input w-48 h-8 text-xs py-1.5"
        />
      </div>

      {/* Canvas area */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden bg-abyss">
        <svg ref={svgRef} className="w-full h-full" />

        {/* Controls */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
          <button onClick={handleZoomIn}  className="btn-ghost w-8 h-8 p-0 justify-center glass"><ZoomIn  className="w-3.5 h-3.5" /></button>
          <button onClick={handleZoomOut} className="btn-ghost w-8 h-8 p-0 justify-center glass"><ZoomOut className="w-3.5 h-3.5" /></button>
          <button onClick={handleReset}   className="btn-ghost w-8 h-8 p-0 justify-center glass"><RotateCcw className="w-3.5 h-3.5" /></button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 glass rounded-xl p-3 z-10">
          <p className="text-2xs text-text-muted font-mono uppercase tracking-widest mb-2">Node Types</p>
          <div className="space-y-1.5">
            {NODE_TYPES.map(({ type, label }) => (
              <button
                key={type}
                onClick={() => {
                  const types = graphFilters.nodeTypes.includes(type)
                    ? graphFilters.nodeTypes.filter((t) => t !== type)
                    : [...graphFilters.nodeTypes, type]
                  setGraphFilters({ nodeTypes: types })
                }}
                className={cn(
                  'flex items-center gap-2 text-xs transition-opacity',
                  !graphFilters.nodeTypes.includes(type) && 'opacity-30'
                )}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: nodeTypeColor(type) }}
                />
                <span className="text-text-secondary">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Node detail panel */}
        <AnimatePresence>
          {selectedNode && (
            <NodePanel node={selectedNode} onClose={() => { setSelectedNode(null); setSelectedNodeId(null) }} />
          )}
        </AnimatePresence>

        {/* Hint */}
        <div className="absolute bottom-4 right-4 glass rounded-lg px-3 py-1.5 z-10">
          <p className="text-2xs text-text-muted font-mono flex items-center gap-1.5">
            <Info className="w-3 h-3" />
            Click node to inspect · Drag to rearrange · Scroll to zoom
          </p>
        </div>
      </div>
    </div>
  )
}
