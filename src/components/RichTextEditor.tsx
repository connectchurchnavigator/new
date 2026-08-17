"use client";

import React, { useRef, useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write description...",
  minHeight = "160px"
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Synchronize internal content when external value changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const exec = (command: string, arg: string | undefined = undefined) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div
      style={{
        border: "1.5px solid #cbd5e1",
        borderRadius: "14px",
        overflow: "hidden",
        background: "#fff",
        transition: "border-color 0.2s"
      }}
    >
      {/* TOOLBAR */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "8px 12px",
          background: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          flexWrap: "wrap"
        }}
      >
        <button
          type="button"
          onClick={() => exec("bold")}
          title="Bold (Ctrl+B)"
          style={btnStyle}
        >
          <i className="ti ti-bold"></i>
        </button>

        <button
          type="button"
          onClick={() => exec("italic")}
          title="Italic (Ctrl+I)"
          style={btnStyle}
        >
          <i className="ti ti-italic"></i>
        </button>

        <button
          type="button"
          onClick={() => exec("underline")}
          title="Underline (Ctrl+U)"
          style={btnStyle}
        >
          <i className="ti ti-underline"></i>
        </button>

        <div style={dividerStyle} />

        <button
          type="button"
          onClick={() => exec("formatBlock", "<h3>")}
          title="Heading"
          style={btnStyle}
        >
          <i className="ti ti-h-3"></i>
        </button>

        <button
          type="button"
          onClick={() => exec("insertUnorderedList")}
          title="Bullet List"
          style={btnStyle}
        >
          <i className="ti ti-list"></i>
        </button>

        <button
          type="button"
          onClick={() => exec("insertOrderedList")}
          title="Numbered List"
          style={btnStyle}
        >
          <i className="ti ti-list-numbers"></i>
        </button>

        <div style={dividerStyle} />

        <button
          type="button"
          onClick={() => exec("formatBlock", "<blockquote>")}
          title="Quote"
          style={btnStyle}
        >
          <i className="ti ti-quote"></i>
        </button>

        <button
          type="button"
          onClick={() => {
            const url = prompt("Enter URL link:");
            if (url) exec("createLink", url);
          }}
          title="Insert Link"
          style={btnStyle}
        >
          <i className="ti ti-link"></i>
        </button>

        <button
          type="button"
          onClick={() => exec("removeFormat")}
          title="Clear Formatting"
          style={btnStyle}
        >
          <i className="ti ti-clear-formatting"></i>
        </button>

        <div style={{ flex: 1 }} />

        <button
          type="button"
          onClick={() => exec("undo")}
          title="Undo"
          style={btnStyle}
        >
          <i className="ti ti-arrow-back-up"></i>
        </button>

        <button
          type="button"
          onClick={() => exec("redo")}
          title="Redo"
          style={btnStyle}
        >
          <i className="ti ti-arrow-forward-up"></i>
        </button>
      </div>

      {/* EDITABLE CONTENT AREA */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder}
        style={{
          minHeight,
          padding: "14px",
          fontSize: "14px",
          lineHeight: 1.6,
          color: "#1e293b",
          outline: "none",
          overflowY: "auto"
        }}
      />
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  width: "30px",
  height: "30px",
  borderRadius: "8px",
  border: "none",
  background: "transparent",
  color: "#475569",
  fontSize: "15px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.15s"
};

const dividerStyle: React.CSSProperties = {
  width: "1px",
  height: "18px",
  background: "#cbd5e1",
  margin: "0 4px"
};
