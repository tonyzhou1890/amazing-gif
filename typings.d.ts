declare module '*.json' {
  const value: any
  export default value
}

declare module '*.svg' {
  const src: string
  export default src
}

declare module 'web-worker:*' {
  const WorkerFactory: new () => Worker
  export default WorkerFactory
}
