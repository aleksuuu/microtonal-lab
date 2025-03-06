declare module 'monome-grid' {
    type GridCallback = (x: number, y: number, s: number) => void;
  
    interface Grid {
      key(callback: GridCallback): void;
      refresh(led: number[][]): void;
    }
  
    export default function monomeGrid(id?: string): Promise<Grid>;
  }
  