import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const categorias = [
  {
    nome: "Lanches",
    produtos: [
      { id: 1, nome: "X-Burguer", preco: 15 },
      { id: 2, nome: "X-Salada", preco: 17 },
    ],
  },
  {
    nome: "Porções",
    produtos: [
      { id: 5, nome: "Batata Frita", preco: 12 },
      { id: 6, nome: "Frango a passarinho", preco: 18 },
    ],
  },
  {
    nome: "Bebidas",
    produtos: [
      { id: 3, nome: "Refrigerante", preco: 7 },
      { id: 4, nome: "Suco", preco: 6 },
    ],
  },
];

const palavrasProibidas = ["palavrão1", "palavrão2", "idiota", "burro", "otário"];

const normalizarTexto = (texto) => {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]/gi, "");
};

export default function App() {
  const [categoriaAtiva, setCategoriaAtiva] = useState("Lanches");
  const [pedido, setPedido] = useState([]);
  const [cliente, setCliente] = useState({
    nome: "",
    telefone: "",
    pagamento: "",
    endereco: "",
    rua: "",
    numero: "",
    complemento: "",
  });
  const [confirmarModal, setConfirmarModal] = useState(false);
  const [enderecoModal, setEnderecoModal] = useState(false);
  const [feedbackItem, setFeedbackItem] = useState(null);
  const [whatsEnviado, setWhatsEnviado] = useState(false);

  useEffect(() => {
    const salvo = localStorage.getItem("pedido");
    const enderecoSalvo = localStorage.getItem("endereco");
    const enviadoSalvo = localStorage.getItem("whatsEnviado");
    if (salvo) setPedido(JSON.parse(salvo));
    if (enderecoSalvo) setCliente((prev) => ({ ...prev, endereco: enderecoSalvo }));
    if (enviadoSalvo === "true") setWhatsEnviado(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("pedido", JSON.stringify(pedido));
  }, [pedido]);

  const adicionarAoPedido = (produto) => {
    setPedido([...pedido, produto]);
    setFeedbackItem(produto.id);
    setTimeout(() => setFeedbackItem(null), 600);
  };

  const removerItem = (index) => {
    const novoPedido = [...pedido];
    novoPedido.splice(index, 1);
    setPedido(novoPedido);
  };

  const montarMensagem = () => {
    const lista = pedido.map((p) => `- ${p.nome} R$${p.preco}`).join("\n");
    const total = pedido.reduce((acc, p) => acc + p.preco, 0);
    const enderecoCompleto = `${cliente.rua}, ${cliente.numero}${cliente.complemento ? `, ${cliente.complemento}` : ""}`;
    return `Olá, me chamo ${cliente.nome}\nTelefone: ${cliente.telefone}\nEndereço: ${enderecoCompleto}\nForma de pagamento: ${cliente.pagamento}\nPedido:\n${lista}\nTotal: R$${total}`;
  };

  const validarTelefone = (tel) => {
    return /^\d{10,11}$/.test(tel.replace(/\D/g, ""));
  };

  const contemPalavraProibida = (texto) => {
    const nomeLimpo = normalizarTexto(texto);
    return palavrasProibidas.some((palavra) => nomeLimpo.includes(normalizarTexto(palavra)));
  };

  const enviarWhatsApp = () => {
    const enderecoCompleto = `${cliente.rua}, ${cliente.numero}${cliente.complemento ? `, ${cliente.complemento}` : ""}`;
    localStorage.setItem("endereco", enderecoCompleto);
    const msg = encodeURIComponent(montarMensagem());
    window.open(`https://wa.me/55${cliente.telefone.replace(/\D/g, "")}?text=${msg}`, "_blank");
    setConfirmarModal(false);
    setEnderecoModal(false);
    setWhatsEnviado(true);
    localStorage.setItem("whatsEnviado", "true");
  };

  const total = pedido.reduce((acc, p) => acc + p.preco, 0);
  const nomeInvalido = contemPalavraProibida(cliente.nome);

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4 relative">
      <h1 className="text-2xl font-bold">Cardápio</h1>

      <div className="flex gap-2 overflow-x-auto">
        {categorias.map((cat) => (
          <button
            key={cat.nome}
            className={`px-4 py-2 rounded-full border ${
              cat.nome === categoriaAtiva ? "bg-blue-500 text-white" : ""
            }`}
            onClick={() => setCategoriaAtiva(cat.nome)}
          >
            {cat.nome}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {categorias
          .find((cat) => cat.nome === categoriaAtiva)
          .produtos.map((prod) => (
            <motion.div
              key={prod.id}
              animate={feedbackItem === prod.id ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5 }}
              className="border p-2 rounded shadow"
            >
              <h2 className="font-semibold">{prod.nome}</h2>
              <p className="text-sm">R${prod.preco}</p>
              <button
                className="mt-2 text-sm bg-green-500 text-white px-2 py-1 rounded"
                onClick={() => adicionarAoPedido(prod)}
              >
                Adicionar
              </button>
            </motion.div>
          ))}
      </div>

      <div className="border-t pt-4">
        <h2 className="text-xl font-semibold mb-2">Seu Pedido</h2>
        {pedido.map((item, index) => (
          <div key={index} className="flex justify-between items-center mb-1">
            <span>{item.nome} - R${item.preco}</span>
            <button onClick={() => removerItem(index)} className="text-red-500 text-sm">
              Remover
            </button>
          </div>
        ))}
        <div className="mt-2 font-bold text-right">Total: R${total}</div>
        <button
          onClick={() => setPedido([])}
          className="text-sm text-red-600 mt-2 underline"
        >
          Limpar pedido
        </button>
      </div>

      <div className="space-y-2">
        <input
          className="w-full p-2 border rounded"
          placeholder="Seu nome"
          value={cliente.nome}
          onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
        />
        {nomeInvalido && (
          <p className="text-red-600 text-sm">Por favor, digite um nome apropriado.</p>
        )}
        <input
          className="w-full p-2 border rounded"
          placeholder="Telefone (com DDD)"
          value={cliente.telefone}
          onChange={(e) => setCliente({ ...cliente, telefone: e.target.value })}
        />
        <select
          className="w-full p-2 border rounded"
          value={cliente.pagamento}
          onChange={(e) => setCliente({ ...cliente, pagamento: e.target.value })}
        >
          <option value="">Selecione a forma de pagamento</option>
          <option value="Cartão de Débito">Cartão de Débito</option>
          <option value="Cartão de Crédito">Cartão de Crédito</option>
          <option value="Pix">Pix</option>
          <option value="Dinheiro">Dinheiro</option>
        </select>
        <button
          disabled={pedido.length === 0 || !cliente.nome || nomeInvalido || !validarTelefone(cliente.telefone) || !cliente.pagamento || whatsEnviado}
          className="w-full bg-blue-600 text-white py-2 rounded mt-2 disabled:opacity-50"
          onClick={() => setEnderecoModal(true)}
        >
          {whatsEnviado ? "Pedido já enviado" : "Enviar pedido no WhatsApp"}
        </button>
      </div>

      {enderecoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow max-w-sm w-full space-y-4">
            <h2 className="text-lg font-bold">Confirme seu Endereço</h2>
            <input
              className="w-full p-2 border rounded"
              placeholder="Rua"
              value={cliente.rua}
              onChange={(e) => setCliente({ ...cliente, rua: e.target.value })}
            />
            <input
              className="w-full p-2 border rounded"
              placeholder="Número"
              value={cliente.numero}
              onChange={(e) => setCliente({ ...cliente, numero: e.target.value })}
            />
            <input
              className="w-full p-2 border rounded"
              placeholder="Complemento (opcional)"
              value={cliente.complemento}
              onChange={(e) => setCliente({ ...cliente, complemento: e.target.value })}
            />
            <div className="flex justify-between mt-4">
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded"
                onClick={() => setEnderecoModal(false)}
              >
                Cancelar
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={() => {
                  setEnderecoModal(false);
                  setConfirmarModal(true);
                }}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow max-w-sm w-full space-y-4">
            <h2 className="text-lg font-bold">Confirmar Pedido</h2>
            <p><strong>Nome:</strong> {cliente.nome}</p>
            <p><strong>Telefone:</strong> {cliente.telefone}</p>
            <p><strong>Endereço:</strong> {cliente.rua}, {cliente.numero}{cliente.complemento ? `, ${cliente.complemento}` : ""}</p>
            <p><strong>Pagamento:</strong> {cliente.pagamento}</p>
            <hr />
            {pedido.map((item, i) => (
              <p key={i}>- {item.nome} R${item.preco}</p>
            ))}
            <p className="font-bold">Total: R${total}</p>
            <div className="flex justify-between mt-4">
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded"
                onClick={() => setConfirmarModal(false)}
              >
                Voltar
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={enviarWhatsApp}
              >
                Enviar no WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
