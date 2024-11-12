'use client';
import { useEffect, useState } from "react";
import axios from "axios";

interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
}

export default function Categories() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaActual, setCategoriaActual] = useState<Categoria | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Para manejar errores

  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/categories");
      setCategorias(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("No se pudieron cargar las categorías."); // Mensaje de error
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Resetear el error antes de enviar

    try {
      if (categoriaActual) {
        await axios.put(`/api/categories/${categoriaActual.id}`, { nombre, descripcion });
      } else {
        await axios.post("/api/categories", { nombre, descripcion });
      }
      // Resetear el formulario
      setNombre("");
      setDescripcion("");
      setCategoriaActual(null);
      // Recargar categorías después del envío
      await fetchCategorias();
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Ocurrió un error al guardar la categoría."); // Mensaje de error
    }
  };

  const handleEdit = (categoria: Categoria) => {
    setCategoriaActual(categoria);
    setNombre(categoria.nombre);
    setDescripcion(categoria.descripcion);
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/categories/${id}`);
      await fetchCategorias();
    } catch (error) {
      console.error("Error deleting category:", error);
      setError("Ocurrió un error al eliminar la categoría."); // Mensaje de error
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestión de Categorías</h1>
      {error && <div className="text-red-500">{error}</div>} {/* Mensaje de error */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl mb-2">Categorías</h2>
          <ul className="list-disc pl-5">
            {categorias.map((categoria) => (
              <li key={categoria.id} className="flex justify-between items-center">
                <span>{categoria.nombre}</span>
                <div>
                  <button 
                    onClick={() => handleEdit(categoria)} 
                    className="bg-blue-500 text-white px-2 py-1 rounded" 
                    aria-label={`Editar categoría ${categoria.nombre}`}>
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(categoria.id)} 
                    className="bg-red-500 text-white px-2 py-1 rounded ml-2" 
                    aria-label={`Eliminar categoría ${categoria.nombre}`}>
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h2 className="text-xl mb-2">{categoriaActual ? "Editar Categoría" : "Crear Categoría"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-1">Nombre de la Categoría (máx. 15 caracteres):</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="border border-gray-300 rounded p-2 w-full"
                maxLength={15}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Descripción de la Categoría (máx. 45 caracteres):</label>
              <input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="border border-gray-300 rounded p-2 w-full"
                maxLength={45}
                required
              />
            </div>
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
              {categoriaActual ? "Actualizar" : "Crear"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
