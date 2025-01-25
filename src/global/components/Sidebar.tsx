import React, { useState } from "react";

interface SidebarProps {
  setFilter: (filter: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ setFilter }) => {
  const [active, setActive] = useState<string | null>(null);

  const handleClick = (filter: string) => {
    setActive(filter);
    setFilter(filter);
  };

  return (
    <div
      style={{
        width: "200px",
        borderRight: "1px solid #ddd",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {[
        { label: "경매대기상품", value: "SCHEDULED" },
        { label: "경매진행중상품", value: "ONGOING" },
        { label: "경매완료상품", value: "ENDED" },
      ].map((item) => (
        <div
          key={item.value}
          onClick={() => handleClick(item.value)}
          style={{
            padding: "10px",
            backgroundColor: active === item.value ? "#ddd" : "#fff",
            cursor: "pointer",
            borderBottom: "1px solid #ccc",
          }}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
