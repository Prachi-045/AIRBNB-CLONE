"use client";

const categories = [
  ["All", "⌂"], ["Beach", "☂"], ["Mountains", "△"], ["Design", "⌑"], ["Lakes", "⌁"], ["Countryside", "♧"], ["Amazing pools", "◌"], ["Cabins", "▱"], ["Trending", "♨"],
];

export function CategoryRail({ active, onChange }: { active: string; onChange: (category: string) => void }) {
  return <div className="container"><div className="category-row">{categories.map(([name, emoji]) => <button key={name} onClick={() => onChange(name)} className={`category ${active === name ? "active" : ""}`}><span className="emoji">{emoji}</span>{name}</button>)}<button className="filter-button">⚙ Filters</button></div></div>;
}
