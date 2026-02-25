import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X, Settings } from "lucide-react";

const initialProducts = [
  { id: 1, name: "Caneta Gel Ursinho", price: 9.9, stock: 5 },
  { id: 2, name: "Borracha Cupcake", price: 6.5, stock: 3 },
  { id: 3, name: "Apontador Gatinho", price: 12.0, stock: 2 }
];

export default function FofaMenteSite() {
  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [isAdminLogged, setIsAdminLogged] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminStoredPassword, setAdminStoredPassword] = useState("1234");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("azul");
  const [recoveryInput, setRecoveryInput] = useState("");
  const [adminEmail, setAdminEmail] = useState("admin@fofamente.com");
  const [recoveryEmailInput, setRecoveryEmailInput] = useState("");

  // Recuperar login, senha e resposta de segurança salvos
  useEffect(() => {
    const savedLogin = localStorage.getItem("fofamente_admin_logged");
    const savedPassword = localStorage.getItem("fofamente_admin_password");
    const savedAnswer = localStorage.getItem("fofamente_admin_recovery");

    if (savedLogin === "true") setIsAdminLogged(true);
    if (savedPassword) setAdminStoredPassword(savedPassword);
    if (savedAnswer) setSecurityAnswer(savedAnswer);
  }, []);

  useEffect(() => {
    localStorage.setItem("fofamente_admin_logged", isAdminLogged);
  }, [isAdminLogged]);

  useEffect(() => {
    localStorage.setItem("fofamente_admin_password", adminStoredPassword);
  }, [adminStoredPassword]);

  useEffect(() => {
    localStorage.setItem("fofamente_admin_recovery", securityAnswer);
  }, [securityAnswer]);

  useEffect(() => {
    const savedEmail = localStorage.getItem("fofamente_admin_email");
    if (savedEmail) setAdminEmail(savedEmail);
  }, []);

  useEffect(() => {
    localStorage.setItem("fofamente_admin_email", adminEmail);
  }, [adminEmail]);
  const [paymentMethod, setPaymentMethod] = useState("Pix");
  const [sales, setSales] = useState([]);
  const [purchaseList, setPurchaseList] = useState([]);

  const gerarListaCompra = () => {
    const hoje = new Date();

    const lista = products.map(prod => {
      const ultimos30 = sales.filter(s => {
        const dataVenda = new Date(s.date);
        const diffDias = (hoje - dataVenda) / (1000 * 60 * 60 * 24);
        return diffDias <= 30;
      });

      let vendidos30 = 0;
      ultimos30.forEach(sale => {
        sale.items.forEach(item => {
          if (item.name === prod.name) vendidos30 += 1;
        });
      });

      const sugestao = Math.max(vendidos30 - prod.stock, 0);

      return sugestao > 0 ? { nome: prod.name, quantidade: sugestao, preco: prod.price } : null;
    }).filter(Boolean);

    setPurchaseList(lista);
  };

  // Atualiza automaticamente sempre que houver mudança
  useEffect(() => {
    gerarListaCompra();
  }, [sales, products]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", stock: "" });

  useEffect(() => {
    const stored = localStorage.getItem("fofamente_sales");
    if (stored) setSales(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("fofamente_sales", JSON.stringify(sales));
  }, [sales]);

  const addToCart = (product) => {
    if (product.stock <= 0) return;

    setCart([...cart, product]);
    setProducts(products.map(p =>
      p.id === product.id ? { ...p, stock: p.stock - 1 } : p
    ));
  };

  const finalizePurchase = () => {
    if (cart.length === 0) return;

    const newSale = {
      id: Date.now(),
      date: new Date().toISOString(),
      items: cart,
      total: subtotal,
      payment: paymentMethod
    };

    setSales([...sales, newSale]);
    setCart([]);
    setCartOpen(false);
    alert("Compra finalizada com sucesso 💕");
  };

  const updateStock = (id, value) => {
    setProducts(products.map(p =>
      p.id === id ? { ...p, stock: Number(value) } : p
    ));
  };

  const addNewProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) return;

    const product = {
      id: Date.now(),
      name: newProduct.name,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock)
    };

    setProducts([...products, product]);
    setNewProduct({ name: "", price: "", stock: "" });
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-pink-400">FofaMente</h1>
        <div className="flex gap-3">
          <Button onClick={() => setAdminOpen(!adminOpen)}>
            <Settings size={16} />
          </Button>
          <Button onClick={() => setCartOpen(true)}>
            <ShoppingCart size={16} /> ({cart.length})
          </Button>
        </div>
      </header>

      {!adminOpen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map(product => (
            <Card key={product.id} className="rounded-2xl shadow">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p>R$ {product.price.toFixed(2)}</p>
                <p className="text-sm">Estoque: {product.stock}</p>
                {product.stock === 0 && (
                  <p className="text-red-500 text-sm">Esgotado</p>
                )}
                <Button
                  disabled={product.stock === 0}
                  className="mt-3"
                  onClick={() => addToCart(product)}
                >
                  Adicionar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {adminOpen && (
        <div className="bg-white p-6 rounded-2xl shadow-lg max-w-5xl mx-auto space-y-10">
          {!isAdminLogged ? (
            <div className="max-w-sm mx-auto bg-pink-50 p-6 rounded-2xl shadow text-center space-y-4">
              <h2 className="text-lg font-bold">Login Administrativo</h2>
              <input
                type="password"
                placeholder="Digite a senha"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              <Button
                className="w-full"
                onClick={() => {
                  if (adminPassword === adminStoredPassword) {
                    setIsAdminLogged(true);
                    setAdminPassword("");
                  } else {
                    alert("Senha incorreta");
                  }
                }}
              >
                Entrar
              </Button>

              <div className="text-xs text-gray-500 mt-2">Pergunta de segurança: Qual sua cor favorita?</div>
              <input
                type="text"
                placeholder="Resposta para recuperar"
                value={recoveryInput}
                onChange={(e) => setRecoveryInput(e.target.value)}
                className="w-full border rounded px-3 py-2 mt-1"
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  if (recoveryInput.toLowerCase() === securityAnswer.toLowerCase()) {
                    setAdminStoredPassword("1234");
                    alert("Senha redefinida para 1234");
                  } else {
                    alert("Resposta incorreta");
                  }
                }}
              >
                Recuperar via Pergunta
              </Button>

              <div className="text-xs text-gray-500 mt-4">Ou recuperar via e-mail</div>
              <input
                type="email"
                placeholder="Digite seu e-mail"
                value={recoveryEmailInput}
                onChange={(e) => setRecoveryEmailInput(e.target.value)}
                className="w-full border rounded px-3 py-2 mt-1"
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  if (recoveryEmailInput === adminEmail) {
                    alert("E-mail enviado com instruções para redefinir a senha (simulação) 📧");
                  } else {
                    alert("E-mail não encontrado");
                  }
                }}
              >
                Enviar Link de Recuperação
              </Button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Painel Administrativo</h2>
                <Button variant="outline" onClick={() => setIsAdminLogged(false)}>
                  Sair
                </Button>
              </div>

              <div className="bg-pink-50 p-4 rounded-2xl space-y-4">
                <h3 className="font-semibold">Segurança da Conta</h3>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Alterar Senha</p>
                  <input
                    type="password"
                    placeholder="Nova senha"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                  />
                  <Button
                    onClick={() => {
                      if (newAdminPassword.length < 4) {
                        alert("A senha deve ter pelo menos 4 caracteres");
                        return;
                      }
                      setAdminStoredPassword(newAdminPassword);
                      setNewAdminPassword("");
                      alert("Senha alterada com sucesso 💕");
                    }}
                  >
                    Salvar Nova Senha
                  </Button>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <p className="text-sm font-medium">Alterar E-mail de Recuperação</p>
                  <input
                    type="email"
                    placeholder="Novo e-mail"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      alert("E-mail atualizado com sucesso 📧");
                    }}
                  >
                    Salvar Novo E-mail
                  </Button>
                </div>
              </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg max-w-5xl mx-auto space-y-10">
          <h2 className="text-xl font-bold">Painel Administrativo</h2>

          {/* NOTIFICAÇÃO TOPO - PRODUTO CAMPEÃO */}
          {(() => {
            const ranking = {};
            sales.forEach(sale => {
              sale.items.forEach(item => {
                ranking[item.name] = (ranking[item.name] || 0) + 1;
              });
            });

            const ordenado = Object.entries(ranking).sort((a, b) => b[1] - a[1]);
            if (ordenado.length === 0) return null;

            const topNome = ordenado[0][0];
            const topQuantidadeVendida = ordenado[0][1];
            const topProduto = products.find(p => p.name === topNome);

            if (!topProduto) return null;

            // calcular média mensal (últimos 30 dias)
            const hoje = new Date();
            const ultimos30 = sales.filter(s => {
              const dataVenda = new Date(s.date);
              const diffDias = (hoje - dataVenda) / (1000 * 60 * 60 * 24);
              return diffDias <= 30;
            });

            let totalUltimos30 = 0;
            ultimos30.forEach(sale => {
              sale.items.forEach(item => {
                if (item.name === topNome) totalUltimos30 += 1;
              });
            });

            const mediaMensal = totalUltimos30;
            const sugestaoCompra = Math.max(mediaMensal - topProduto.stock, 0);

            if (topProduto.stock > 2) return null;

            return (
              <div className="bg-red-100 text-red-600 p-4 rounded-2xl font-semibold text-center shadow space-y-2">
                <div>
                  🚨 Atenção, Jackeline! O produto mais vendido "{topProduto.name}" está quase esgotando.
                </div>
                <div>
                  Estoque atual: {topProduto.stock}
                </div>
                <div className="bg-white text-red-500 p-2 rounded-xl">
                  📦 Sugestão de reposição: Comprar aproximadamente {sugestaoCompra} unidades.
                </div>
              </div>
            );
          })()}

          {/* RESUMO FINANCEIRO */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-pink-50 p-4 rounded-2xl shadow text-center">
              <p className="text-sm">Total de Vendas</p>
              <p className="text-xl font-bold">{sales.length}</p>
            </div>

            <div className="bg-pink-50 p-4 rounded-2xl shadow text-center">
              <p className="text-sm">Faturamento Total</p>
              <p className="text-xl font-bold">
                R$ {sales.reduce((acc, s) => acc + s.total, 0).toFixed(2)}
              </p>
            </div>

            <div className="bg-pink-50 p-4 rounded-2xl shadow text-center">
              <p className="text-sm">Total via Pix</p>
              <p className="text-xl font-bold">
                R$ {sales.filter(s => s.payment === 'Pix').reduce((acc, s) => acc + s.total, 0).toFixed(2)}
              </p>
            </div>

            <div className="bg-pink-50 p-4 rounded-2xl shadow text-center">
              <p className="text-sm">Total via Cartão</p>
              <p className="text-xl font-bold">
                R$ {sales.filter(s => s.payment === 'Cartão').reduce((acc, s) => acc + s.total, 0).toFixed(2)}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Controle de Estoque</h3>
            {products.map(product => (
              <div key={product.id} className="flex justify-between items-center mb-2">
                <span>{product.name}</span>
                <input
                  type="number"
                  value={product.stock}
                  onChange={(e) => updateStock(product.id, e.target.value)}
                  className="border rounded px-2 py-1 w-20"
                />
              </div>
            ))}
          </div>

          <div>
            <h3 className="font-semibold mb-3">Adicionar Novo Produto</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Nome"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="border rounded px-3 py-2"
              />
              <input
                type="number"
                placeholder="Preço"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                className="border rounded px-3 py-2"
              />
              <input
                type="number"
                placeholder="Estoque"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                className="border rounded px-3 py-2"
              />
            </div>
            <Button className="mt-4" onClick={addNewProduct}>
              Adicionar Produto
            </Button>
          </div>

          <div>
            <h3 className="font-semibold mb-4">🏆 Produtos Mais Vendidos</h3>

            {(() => {
              const ranking = {};
              sales.forEach(sale => {
                sale.items.forEach(item => {
                  ranking[item.name] = (ranking[item.name] || 0) + 1;
                });
              });

              const ordenado = Object.entries(ranking)
                .sort((a, b) => b[1] - a[1]);

              if (ordenado.length === 0) {
                return <p className="text-sm text-gray-500">Nenhuma venda ainda.</p>;
              }

              return ordenado.slice(0,5).map(([nome, qtd], index) => (
                <div key={index} className="flex justify-between bg-pink-50 p-3 rounded-xl mb-2 text-sm">
                  <span>{index === 0 ? '🥇 ' : ''}{nome}</span>
                  <span>{qtd} vendidos</span>
                </div>
              ));
            })()}
          </div>

          {/* SUGESTÃO AUTOMÁTICA PARA TODOS OS PRODUTOS */}
          <div>
            <h3 className="font-semibold mb-4">📦 Sugestão de Reposição (Base Últimos 30 Dias)</h3>

            {products.map(prod => {
              const hoje = new Date();
              const ultimos30 = sales.filter(s => {
                const dataVenda = new Date(s.date);
                const diffDias = (hoje - dataVenda) / (1000 * 60 * 60 * 24);
                return diffDias <= 30;
              });

              let vendidos30 = 0;
              ultimos30.forEach(sale => {
                sale.items.forEach(item => {
                  if (item.name === prod.name) vendidos30 += 1;
                });
              });

              const sugestao = Math.max(vendidos30 - prod.stock, 0);

              return (
                <div key={prod.id} className="flex justify-between items-center bg-white p-3 rounded-xl shadow mb-2 text-sm">
                  <div>
                    <div className="font-medium">{prod.name}</div>
                    <div className="text-gray-500">Vendidos (30d): {vendidos30} | Estoque: {prod.stock}</div>
                  </div>
                  <div className="font-semibold text-pink-500">
                    {sugestao > 0 ? `Comprar ~${sugestao}` : 'Estoque OK'}
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <h3 className="font-semibold mb-4">📊 Vendas Realizadas</h3>

            {sales.length === 0 && (
              <p className="text-sm text-gray-500">Nenhuma venda registrada ainda.</p>
            )}

            {sales.map((sale) => (
              <div key={sale.id} className="border rounded-xl p-4 mb-4 bg-pink-50">
                <div className="flex justify-between text-sm mb-2">
                  <span><strong>Data:</strong> {new Date(sale.date).toLocaleString()}</span>
                  <span><strong>Pagamento:</strong> {sale.payment}</span>
                </div>

                <div className="text-sm mb-2">
                  {sale.items.map((item, index) => (
                    <div key={index}>
                      {item.name} - R$ {item.price.toFixed(2)}
                    </div>
                  ))}
                </div>

                <div className="font-semibold">
                  Total: R$ {sale.total.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
                  className="border rounded px-2 py-1 w-20"
                />
              </div>
            ))}
          </div>

          <div>
            <h3 className="font-semibold mb-3">Adicionar Novo Produto</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Nome"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="border rounded px-3 py-2"
              />
              <input
                type="number"
                placeholder="Preço"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                className="border rounded px-3 py-2"
              />
              <input
                type="number"
                placeholder="Estoque"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                className="border rounded px-3 py-2"
              />
            </div>
            <Button className="mt-4" onClick={addNewProduct}>
              Adicionar Produto
            </Button>
          </div>
        </div>
      )}

      {cartOpen && (
        <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-2xl p-6">
          <div className="flex justify-between mb-6">
            <h2 className="font-bold">Carrinho</h2>
            <button onClick={() => setCartOpen(false)}>
              <X />
            </button>
          </div>

          {cart.map((item, index) => (
            <div key={index} className="mb-2 text-sm">
              {item.name} - R$ {item.price.toFixed(2)}
            </div>
          ))}

          <div className="mt-6 font-bold">
            Total: R$ {subtotal.toFixed(2)}
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Forma de Pagamento</h3>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border rounded px-2 py-2"
            >
              <option value="Pix">Pix</option>
              <option value="Cartão">Cartão</option>
              <option value="Boleto">Boleto</option>
            </select>
          </div>

          <Button className="mt-6 w-full" onClick={finalizePurchase}>
            Finalizar Compra
          </Button>
        </div>
      )}
    </div>
  );
}
