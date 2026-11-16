import "./App.css";
import { lazy, Suspense, useState, useMemo, useEffect } from "react";
import type { FormEvent } from "react";
import {
  ArrowLeftRight,
  Bell,
  Boxes,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  LayoutDashboard,
  Menu,
  Package,
  Plus,
  Search,
  Settings,
  Users,
  X,
  Zap,
} from "lucide-react";
import type { Movement, Product } from "./types/inventory";
import type { Page } from "./types/navigation";
import { normalizeSku, resolveMovementProduct, stockStatus, validateProduct } from "./lib/inventory";
import { PageHeader } from "./components/common";
import { ProductDialogs } from "./components/ProductDialogs";
import { MovementDialogs } from "./components/MovementDialogs";
import { localDateValue } from "./lib/stock-history";
import { ProductsPage } from "./pages/ProductsPage";
import { StockPage } from "./pages/StockPage";
import { MovementsPage } from "./pages/MovementsPage";
import { AutomationPage } from "./pages/AutomationPage";
import { Login } from "./pages/Login";
import { emptyProductForm, initialMovements, initialProducts } from "./data/demo";
import { loadFromStorage, saveToStorage } from "./services/demoStorage";

// Gráficos são carregados quando o usuário abre a página, reduzindo o pacote inicial.
const Dashboard = lazy(() => import("./pages/Dashboard").then((module) => ({ default: module.Dashboard })));
const ReportsPage = lazy(() => import("./pages/ReportsPage").then((module) => ({ default: module.ReportsPage })));

function App() {
  const [page, setPage] = useState<Page>("Dashboard");
  const [products, setProducts] = useState<Product[]>(() =>
    loadFromStorage<Product[]>("autostock-products", initialProducts),
  );
  const [movements, setMovements] = useState<Movement[]>(() =>
    loadFromStorage<Movement[]>("autostock-movements", initialMovements),
  );
  useEffect(() => {
    saveToStorage("autostock-products", products);
  }, [products]);
  useEffect(() => {
    saveToStorage("autostock-movements", movements);
  }, [movements]);
  const [globalQuery, setGlobalQuery] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [status, setStatus] = useState("Todas");
  const [modal, setModal] = useState<
    "product" | "edit-product" | "view-product" | "movement" | "correction" | "login" | null
  >(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(
    null,
  );
  const [notice, setNotice] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [loggedIn, setLoggedIn] = useState(true);
  const [productForm, setProductForm] = useState({ ...emptyProductForm });
  const [movementForm, setMovementForm] = useState({
    productId: String(initialProducts[0].id),
    type: "Entrada",
    quantity: "1",
  });
  const [correctionForm, setCorrectionForm] = useState({
    quantity: "",
    reason: "",
  });
  const [period, setPeriod] = useState("Últimos 7 dias");
  const [referenceDate, setReferenceDate] = useState(() => localDateValue(new Date()));
  const selectedProduct = products.find((product) => product.id === selectedProductId);
  const correctingProduct = selectedMovement
    ? resolveMovementProduct(products, selectedMovement)
    : undefined;

  function openProductForm(product?: Product) {
    setSelectedProductId(product?.id ?? null);
    setProductForm(product ? {
      name: product.name,
      sku: product.sku,
      category: product.category,
      stock: String(product.stock),
      minimum: String(product.minimum),
      price: String(product.price),
    } : { ...emptyProductForm });
    setModal(product ? "edit-product" : "product");
  }

  function viewProduct(product: Product) {
    setSelectedProductId(product.id);
    setModal("view-product");
  }

  const low = products.filter(
    (p) => p.stock > 0 && p.stock <= p.minimum,
  ).length;
  const empty = products.filter((p) => p.stock === 0).length;
  const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const stockValue =
    products.reduce((sum, p) => sum + p.stock * p.price, 0);
  const filteredProducts = useMemo(() => products.filter((p) => {
    const searchable = `${p.name} ${p.sku} ${p.category}`.toLowerCase();
    return searchable.includes(globalQuery.trim().toLowerCase()) &&
      searchable.includes(productQuery.trim().toLowerCase()) &&
      (category === "Todas" || p.category === category) &&
      (status === "Todas" || p.status === status);
  }), [products, globalQuery, productQuery, category, status]);

  const toast = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  };
  const navItems: { label: Page; icon: typeof LayoutDashboard }[] = [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "Produtos", icon: Package },
    { label: "Estoque", icon: Boxes },
    { label: "Movimentações", icon: ArrowLeftRight },
    { label: "Relatórios", icon: ChartNoAxesCombined },
    { label: "Automação", icon: Zap },
    { label: "Usuários", icon: Users },
    { label: "Configurações", icon: Settings },
  ];
  const go = (p: Page) => {
    setPage(p);
    setMobileMenu(false);
  };

  function saveProduct(e: FormEvent) {
    e.preventDefault();
    const editing = modal === "edit-product";
    if (editing && !selectedProduct) return toast("Produto não encontrado.");
    const error = validateProduct(productForm, products, editing ? selectedProduct?.id ?? null : null);
    if (error) return toast(error);
    const minimum = Number(productForm.minimum);
    const values = {
      name: productForm.name.trim(),
      sku: normalizeSku(productForm.sku),
      category: productForm.category,
      minimum,
      price: Number(productForm.price),
    };
    if (editing && selectedProduct) {
      setProducts((prev) => prev.map((product) => product.id === selectedProduct.id
        ? { ...product, ...values, status: stockStatus(product.stock, minimum) }
        : product,
      ));
    } else {
      const stock = Number(productForm.stock);
      setProducts((prev) => [
        {
          id: Math.max(...prev.map((p) => p.id), 0) + 1,
          ...values,
          stock,
          status: stockStatus(stock, minimum),
        },
        ...prev,
      ]);
    }
    setProductForm({ ...emptyProductForm });
    setSelectedProductId(null);
    setModal(null);
    toast(editing ? "Produto atualizado com sucesso!" : "Produto cadastrado com sucesso!");
  }
  function saveMovement(e: FormEvent) {
    e.preventDefault();
    const qty = Number(movementForm.quantity);
    if (!Number.isInteger(qty) || qty <= 0) return toast("Informe uma quantidade inteira e positiva.");
    const product = products.find((p) => p.id === Number(movementForm.productId));
    if (!product) return toast("Selecione um produto válido.");
    if (movementForm.type === "Saída" && product.stock < qty)
      return toast("Estoque insuficiente para essa saída.");
    const after =
      product.stock + (movementForm.type === "Entrada" ? qty : -qty);
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id
          ? {
              ...p,
              stock: after,
              status: stockStatus(after, p.minimum),
            }
          : p,
      ),
    );
    setMovements((prev) => [
      {
        id: Math.max(...prev.map((m) => m.id), 0) + 1,
        productId: product.id,
        product: product.name,
        type: movementForm.type as "Entrada" | "Saída",
        quantity: movementForm.type === "Entrada" ? qty : -qty,
        date: new Date().toLocaleString("pt-BR"),
        before: product.stock,
        after,
      },
      ...prev,
    ]);
    setModal(null);
    toast("Movimentação registrada!");
  }
  function saveCorrection(e: FormEvent) {
    e.preventDefault();
    if (!selectedMovement) return;
    if (selectedMovement.type !== "Entrada") return toast("Apenas entradas podem ser corrigidas.");
    if (movements.some((movement) => movement.correctionOf === selectedMovement.id)) {
      return toast("Essa entrada já foi corrigida. Não é possível aplicar o ajuste duas vezes.");
    }
    if (!correctionForm.quantity || !correctionForm.reason.trim())
      return toast("Quantidade correta e justificativa são obrigatórias.");
    const correct = Number(correctionForm.quantity);
    if (!Number.isInteger(correct) || correct < 0) return toast("A quantidade deve ser um inteiro não negativo.");
    const delta = correct - Math.abs(selectedMovement.quantity);
    const product = resolveMovementProduct(products, selectedMovement);
    if (!product) return toast("Produto não identificado de forma única no histórico antigo.");
    const projected = product.stock + delta;
    if (projected < 0) return toast("A correção deixaria o estoque negativo.");
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id
          ? {
              ...p,
              stock: projected,
              status: stockStatus(projected, p.minimum),
            }
          : p,
      ),
    );
    setMovements((prev) => [
      {
        id: Math.max(...prev.map((m) => m.id), 0) + 1,
        productId: product.id,
        product: product.name,
        type: "Correção",
        quantity: delta,
        date: new Date().toLocaleString("pt-BR"),
        before: product.stock,
        after: projected,
        note: correctionForm.reason,
        correctionOf: selectedMovement.id,
      },
      ...prev,
    ]);
    setModal(null);
    setCorrectionForm({ quantity: "", reason: "" });
    toast("Correção registrada no histórico!");
  }

  if (!loggedIn)
    return (
      <Login
        onLogin={() => {
          setLoggedIn(true);
          toast("Bem-vindo ao AutoStock!");
        }}
      />
    );

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Package size={30} strokeWidth={1.8} />
          </div>
          <div>
            <div className="brand-name">
              Auto<span>Stock</span>
            </div>
            <div className="brand-sub">Gestão Inteligente de Estoque</div>
          </div>
          <button
            className="icon-btn mobile-close"
            onClick={() => setMobileMenu(false)}
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="nav-list" aria-label="Navegação principal">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${page === label ? "active" : ""}`}
              onClick={() => go(label)}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-version">
            <div className="mini-logo">
              <Package size={23} />
            </div>
            <div>
              <strong>AutoStock v1.0</strong>
              <small>Controle • Automação • Resultado</small>
            </div>
          </div>
          <div className="demo-label">
            <span className="demo-dot" /> Ambiente demonstrativo
          </div>
        </div>
      </aside>
      {mobileMenu && (
        <div className="backdrop" onClick={() => setMobileMenu(false)} />
      )}
      <main className="main-area">
        <header className="topbar">
          <button
            className="icon-btn mobile-menu-btn"
            onClick={() => setMobileMenu(true)}
            aria-label="Abrir menu"
          >
            <Menu />
          </button>
          <div className="global-search">
            <Search size={18} />
            <input
              value={globalQuery}
              onChange={(e) => {
                setGlobalQuery(e.target.value);
                if (e.target.value) setPage("Produtos");
              }}
              placeholder="Buscar produto, SKU ou categoria..."
            />
            <kbd>Ctrl + K</kbd>
          </div>
          <div className="top-actions">
            <button
              className="icon-btn notification"
              onClick={() => go("Automação")}
              aria-label="Notificações"
            >
              <Bell size={20} />
              <i />
            </button>
            <div className="top-divider" />
            <button
              className="profile"
              onClick={() => toast("Sessão demonstrativa • Administrador")}
            >
              <span className="avatar">IG</span>
              <span className="profile-copy">
                <b>Ikaro Guilherme</b>
                <small>Administrador</small>
              </span>
              <ChevronDown size={17} />
            </button>
          </div>
        </header>
        <div className="page-content">
          <Suspense fallback={<div className="panel" role="status">Carregando módulo...</div>}>
          {page === "Dashboard" && (
            <Dashboard
              products={products}
              movements={movements}
              onCorrect={(movement) => {
                setMovements((current) =>
                  current.map((item) =>
                    item.id === movement.id ? movement : item,
                  ),
                );
              }}
              low={low}
              empty={empty}
              totalUnits={totalUnits}
              stockValue={stockValue}
              period={period}
              setPeriod={setPeriod}
              referenceDate={referenceDate}
              setReferenceDate={setReferenceDate}
              onGo={go}
              onAdd={() => openProductForm()}
              onMovement={() => setModal("movement")}
              onImport={() =>
                toast(
                  "Importação demonstrativa: selecione um arquivo na área Automação.",
                )
              }
            />
          )}
          {page === "Produtos" && (
            <ProductsPage
              products={filteredProducts}
              query={productQuery}
              setQuery={setProductQuery}
              clearGlobalQuery={() => setGlobalQuery("")}
              category={category}
              setCategory={setCategory}
              status={status}
              setStatus={setStatus}
              onAdd={() => openProductForm()}
              onView={viewProduct}
              onEdit={openProductForm}
            />
          )}
          {page === "Estoque" && (
            <StockPage
              products={products}
              onMovement={() => setModal("movement")}
            />
          )}
          {page === "Movimentações" && (
            <MovementsPage
              movements={movements}
              onAdd={() => setModal("movement")}
              onCorrect={(m) => {
                if (!resolveMovementProduct(products, m)) {
                  toast("Não foi possível identificar o produto dessa movimentação antiga com segurança.");
                  return;
                }
                setSelectedMovement(m);
                setCorrectionForm({
                  quantity: String(Math.abs(m.quantity)),
                  reason: "",
                });
                setModal("correction");
              }}
            />
          )}
          {page === "Relatórios" && (
            <ReportsPage
              products={products}
              totalUnits={totalUnits}
              stockValue={stockValue}
            />
          )}
          {page === "Automação" && <AutomationPage onToast={toast} />}
          {page === "Usuários" && (
            <SimplePage
              title="Usuários"
              subtitle="Gerencie os acessos e permissões da plataforma."
              icon={<Users />}
            >
              <div className="user-row">
                <span className="avatar">IG</span>
                <div>
                  <b>Ikaro Guilherme</b>
                  <small>ikaro@autostock.com • Administrador</small>
                </div>
                <span className="status-pill good">Ativo</span>
              </div>
              <div className="user-row">
                <span className="avatar muted-avatar">OP</span>
                <div>
                  <b>Operador de estoque</b>
                  <small>operador@autostock.com • Operador</small>
                </div>
                <span className="status-pill good">Ativo</span>
              </div>
              <button
                className="btn btn-primary"
                onClick={() =>
                  toast("Cadastro de usuário preparado para integração.")
                }
              >
                <Plus size={16} /> Novo usuário
              </button>
            </SimplePage>
          )}
          {page === "Configurações" && (
            <SimplePage
              title="Configurações"
              subtitle="Preferências gerais do AutoStock Intelligence."
              icon={<Settings />}
            >
              <div className="settings-row">
                <div>
                  <b>Notificações de estoque baixo</b>
                  <small>
                    Receber alertas quando um produto atingir o mínimo.
                  </small>
                </div>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="settings-row">
                <div>
                  <b>Resumo diário</b>
                  <small>Exibir resumo operacional no dashboard.</small>
                </div>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="settings-row">
                <div>
                  <b>Fuso horário</b>
                  <small>Horário de Brasília (GMT-3)</small>
                </div>
                <span className="muted">America/Recife</span>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => toast("Preferências salvas nesta demonstração.")}
              >
                Salvar preferências
              </button>
            </SimplePage>
          )}
          </Suspense>
        </div>
      </main>

      <ProductDialogs
        modal={modal}
        selectedProduct={selectedProduct}
        productForm={productForm}
        setProductForm={setProductForm}
        onClose={() => setModal(null)}
        onEditSelected={openProductForm}
        onSaveProduct={saveProduct}
      />
      <MovementDialogs
        modal={modal}
        products={products}
        movementForm={movementForm}
        setMovementForm={setMovementForm}
        correctionForm={correctionForm}
        setCorrectionForm={setCorrectionForm}
        selectedMovement={selectedMovement}
        correctingProduct={correctingProduct}
        onClose={() => setModal(null)}
        onSaveMovement={saveMovement}
        onSaveCorrection={saveCorrection}
      />
      {notice && (
        <div className="toast">
          <Check size={17} />
          {notice}
          <button onClick={() => setNotice("")} aria-label="Fechar aviso">
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}


function SimplePage({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHeader eyebrow="ADMINISTRAÇÃO" title={title} subtitle={subtitle} />
      <section className="panel simple-panel">
        <div className="panel-title">
          <span className="gold-icon">{icon}</span>
          <h3>{title}</h3>
        </div>
        {children}
      </section>
    </>
  );
}

export default App;
