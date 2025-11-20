import React from "react";

export default function ConnectButtonStub() {
  return (
    <button
      onClick={() => {
        console.log("Connect (stub) clicked");
        // aquí puedes abrir un modal propio o redirigir a la pantalla de perfil
      }}
      style={{
        padding: "6px 10px",
        borderRadius: 6,
        border: "1px solid rgba(0,0,0,0.08)",
        background: "linear-gradient(180deg,#fff,#f5f5f5)",
      }}
    >
      Connect
    </button>
  );
}