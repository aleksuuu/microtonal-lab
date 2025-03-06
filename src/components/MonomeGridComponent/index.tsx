let twoToThe32 = Math.pow(2, 32); // Define missing variable
(window as any).twoToThe32 = twoToThe32; // Optional global fix
0
import { useEffect, useState } from "react";
import monomeGrid, { Grid } from "monome-grid";

const MonomeGridComponent = () => {
  const [grid, setGrid] = useState<Grid | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeGrid = async () => {
      const monome = await monomeGrid();

      if (isMounted) {
        setGrid(monome);
        monome.key((x: number, y: number, s: number) => {
          console.log(`x: ${x}, y: ${y}, s: ${s}`);
        });
      }
    };

    initializeGrid();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!grid) return;

    const updateLEDs = () => {
      const led: number[][] = Array.from({ length: 8 }, () =>
        Array.from({ length: 16 }, () => Math.floor(Math.random() * 16))
      );
      grid.refresh(led);
    };

    const intervalId = setInterval(updateLEDs, 100);

    return () => clearInterval(intervalId);
  }, [grid]);

  return (
    <div>{grid ? "Monome Grid Initialized" : "Waiting for Monome Grid…"}</div>
  );
};

export default MonomeGridComponent;
