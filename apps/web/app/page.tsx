"use client";

import { useEffect, useRef } from "react";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";

    const socket = new WebSocket("ws://localhost:8080");
    socketRef.current = socket;

    // activates when msg is recived from the sever
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "draw") {
        ctx.beginPath();// indicate new storke
        ctx.moveTo(data.prevX, data.prevY);// setting the starting point
        ctx.lineTo(data.x, data.y);// current points
        ctx.stroke();//traceing
        ctx.closePath();
      }
    };

    let prevX = 0;
    let prevY = 0;

    const startDrawing = (e: MouseEvent) => {
      drawingRef.current = true;
      prevX = e.offsetX;
      prevY = e.offsetY;
    };

    const draw = (e: MouseEvent) => {
      if (!drawingRef.current) return;

      const x = e.offsetX;
      const y = e.offsetY;

      // draw locally
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.closePath();

      // sending to server
      socketRef.current?.send(
        JSON.stringify({
          type: "draw",
          prevX,
          prevY,
          x,
          y,
        })
      );

      prevX = x;
      prevY = y;
    };

    const stopDrawing = () => {
      drawingRef.current = false;
    };

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);

    return () => {
      socket.close();
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseleave", stopDrawing);
    };
  }, []);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={5000}
        height={6000}
        style={{ border: "1px solid black", background: "white" }}
      />
    </div>
  );
}