import React, { useEffect, useState } from "react";
import "./style.css";

function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [offset, setOffset] = useState(0);
  const [nomePokemon, setNomePokemon] = useState("");
  const [pokemon, setPokemon] = useState(null);

  // filtros
  const [typeFilter, setTypeFilter] = useState("");
  const [weightFilter, setWeightFilter] = useState("");
  const [heightFilter, setHeightFilter] = useState("");

  // 🔹 carregar lista (CORRIGIDO)
  async function loadPokemons() {
    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=10&offset=${offset}`
      );
      const data = await response.json();

      const promises = data.results.map(async (item) => {
        const res = await fetch(item.url);
        return await res.json();
      });

      const results = await Promise.all(promises);

      // 🔥 REMOVE DUPLICADOS
      setPokemonList((prev) => {
        const all = [...prev, ...results];

        const unique = [];
        const ids = new Set();

        for (let p of all) {
          if (!ids.has(p.id)) {
            ids.add(p.id);
            unique.push(p);
          }
        }

        return unique;
      });
    } catch (err) {
      console.log(err);
    }
  }

  // 🔹 busca (mantida)
  function loadAPI(nome) {
    if (!nome) return;

    let url = `https://pokeapi.co/api/v2/pokemon/${nome}`;

    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        setPokemon(json);
      })
      .catch((err) => {
        console.log(err);
        setPokemon(null);
      });
  }

  useEffect(() => {
    loadPokemons();
  }, [offset]);

  // 🔹 scroll infinito
  useEffect(() => {
    function handleScroll() {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 50
      ) {
        setOffset((prev) => prev + 10);
      }
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🔥 FILTRO (SEU, FUNCIONANDO COM DADOS CORRETOS)
  const filteredPokemons = pokemonList.filter((poke) => {
    if (!poke.types) return false;

    const kg = poke.weight / 10;
    const m = poke.height / 10;

    let matchType = true;
    if (typeFilter !== "") {
      matchType = poke.types.find(
        (t) => t.type.name.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    let matchWeight = true;
    if (weightFilter !== "") {
      if (weightFilter === "light") matchWeight = kg < 30;
      else if (weightFilter === "medium") matchWeight = kg >= 30 && kg < 80;
      else if (weightFilter === "heavy") matchWeight = kg >= 80;
    }

    let matchHeight = true;
    if (heightFilter !== "") {
      if (heightFilter === "small") matchHeight = m < 1;
      else if (heightFilter === "medium") matchHeight = m >= 1 && m < 2;
      else if (heightFilter === "large") matchHeight = m >= 2;
    }

    return matchType && matchWeight && matchHeight;
  });

  return (
    <div className="container">
      <header>
        <strong>Pokemon API</strong>
      </header>

      {/* 🔥 BUSCA (INTACTA) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          loadAPI(nomePokemon);
        }}
      >
        <input
          type="text"
          placeholder="Digite o nome do pokemon"
          value={nomePokemon}
          onChange={(e) => setNomePokemon(e.target.value)}
        />
        <button type="submit">Buscar</button>
      </form>

      {/* 🔥 RESULTADO */}
      {pokemon && (
        <div className="card destaque">
          {pokemon.sprites && (
            <img src={pokemon.sprites.front_default} alt={pokemon.name} />
          )}
          <div>Name: {pokemon.name}</div>
          <div>Nº {pokemon.id}</div>
          <div>Peso: {pokemon.weight / 10}kg</div>
          <div>Altura: {pokemon.height / 10}m</div>
        </div>
      )}

      <div className="layout">
        {/* 🔥 FILTROS */}
        <div className="sidebar">
          <h3>Filtros</h3>

          <select onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">Tipo</option>
            <option value="fire">Fire</option>
            <option value="water">Water</option>
            <option value="grass">Grass</option>
            <option value="electric">Electric</option>
          </select>

          <select onChange={(e) => setWeightFilter(e.target.value)}>
            <option value="">Peso</option>
            <option value="light">Leve</option>
            <option value="medium">Médio</option>
            <option value="heavy">Pesado</option>
          </select>

          <select onChange={(e) => setHeightFilter(e.target.value)}>
            <option value="">Altura</option>
            <option value="small">Pequeno</option>
            <option value="medium">Médio</option>
            <option value="large">Grande</option>
          </select>
        </div>

        {/* 🔥 LISTA */}
        <div className="list">
          {filteredPokemons.map((poke) => (
            <div className="card" key={poke.id}>
              <img src={poke.sprites.front_default} alt={poke.name} />
              <div>{poke.name}</div>
              <div>Nº {poke.id}</div>
              <div>Peso: {poke.weight / 10}kg</div>
              <div>Altura: {poke.height / 10}m</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;