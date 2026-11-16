import "./App.css";
import { useState, useMemo, useEffect } from "react";
import type { FormEvent } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  ArrowRight,
  Bell,
  Boxes,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  ClipboardList,
  CloudUpload,
  Download,
  FileSpreadsheet,
  Filter,
  LayoutDashboard,
  Menu,
  Package,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Zap,
  Pencil,
  Eye,
  RotateCcw,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import type { Movement, Product } from "./types/inventory";
import { normalizeSku, resolveMovementProduct, stockStatus, validateProduct } from "./lib/inventory";
type Page =
  | "Dashboard"
  | "Produtos"
  | "Estoque"
  | "Movimentações"
  | "Relatórios"
  | "Automação"
  | "Usuários"
  | "Configurações";
const initialProducts: Product[] = [
  {
    id: 1,
    name: "Kit de experiências científicas",
    sku: "EXP-001",
    category: "Brinquedos educativos",
    stock: 3,
    minimum: 4,
    price: 89.9,
    status: "Abaixo do mínimo",
  },
  {
    id: 2,
    name: "Quebra-cabeça (300 peças)",
    sku: "QUE-030",
    category: "Jogos",
    stock: 3,
    minimum: 4,
    price: 42.5,
    status: "Abaixo do mínimo",
  },
  {
    id: 3,
    name: "Dinossauro de pelúcia",
    sku: "PEL-014",
    category: "Pelúcias",
    stock: 2,
    minimum: 4,
    price: 59.9,
    status: "Abaixo do mínimo",
  },
  {
    id: 4,
    name: "Kit praia infantil",
    sku: "PRA-008",
    category: "Brinquedos",
    stock: 0,
    minimum: 3,
    price: 35,
    status: "Sem estoque",
  },
  {
    id: 5,
    name: "Blocos de montar 120 peças",
    sku: "BLO-120",
    category: "Jogos",
    stock: 48,
    minimum: 10,
    price: 74.9,
    status: "Em estoque",
  },
  {
    id: 6,
    name: "Lousa magnética infantil",
    sku: "LOU-022",
    category: "Educativos",
    stock: 32,
    minimum: 8,
    price: 65,
    status: "Em estoque",
  },
  {
    id: 7,
    name: "Carrinho de corrida",
    sku: "CAR-019",
    category: "Brinquedos",
    stock: 61,
    minimum: 12,
    price: 29.9,
    status: "Em estoque",
  },
  {
    id: 8,
    name: "Jogo de memória animal",
    sku: "MEM-010",
    category: "Jogos",
    stock: 24,
    minimum: 8,
    price: 31.9,
    status: "Em estoque",
  },
];
const initialMovements: Movement[] = [
  {
    id: 51,
    product: "Kit de experiências científicas",
    type: "Saída",
    quantity: -6,
    date: "06/11/2026 14:27",
    before: 9,
    after: 3,
  },
  {
    id: 50,
    product: "Kit de experiências científicas",
    type: "Entrada",
    quantity: 6,
    date: "06/11/2026 14:10",
    before: 3,
    after: 9,
  },
  {
    id: 49,
    product: "Quebra-cabeça (300 peças)",
    type: "Entrada",
    quantity: 3,
    date: "06/11/2026 10:21",
    before: 0,
    after: 3,
  },
  {
    id: 48,
    product: "Dinossauro de pelúcia",
    type: "Saída",
    quantity: -2,
    date: "05/11/2026 16:40",
    before: 4,
    after: 2,
  },
];
// Datas locais, sem conversão para UTC, para respeitar o dia selecionado.
function localDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function movementDate(value: string): Date | null {
  const match = value.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[,\s]+(\d{1,2}):(\d{2}))?/,
  );
  if (match) {
    const parsed = new Date(
      Number(match[3]),
      Number(match[2]) - 1,
      Number(match[1]),
      Number(match[4] ?? 0),
      Number(match[5] ?? 0),
    );
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

// Demonstração local: reconstrói saldos a partir das movimentações registradas.
// Dias anteriores ao primeiro lançamento ficam sem dados, não são inventados.
function buildStockHistory(
  products: Product[],
  movements: Movement[],
  period: string,
  referenceDate: string,
): { day: string; total: number | null }[] {
  const [year, month, day] = referenceDate.split("-").map(Number);
  const selected = new Date(year, month - 1, day);
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = Number.isNaN(selected.getTime()) || selected.getTime() > todayStart.getTime()
    ? todayStart
    : selected;
  const numberOfDays = period.includes("90") ? 90 : period.includes("30") ? 30 : 7;
  const currentUnits = products.reduce((sum, product) => sum + product.stock, 0);
  const datedMovements = movements
    .map((movement) => ({ timestamp: movementDate(movement.date)?.getTime(), delta: movement.quantity }))
    .filter((movement): movement is { timestamp: number; delta: number } =>
      movement.timestamp !== undefined && Number.isFinite(movement.timestamp),
    );
  const firstEvent = datedMovements.length
    ? Math.min(...datedMovements.map((movement) => movement.timestamp))
    : Number.POSITIVE_INFINITY;

  return Array.from({ length: numberOfDays }, (_, index) => {
    const currentDay = new Date(end.getFullYear(), end.getMonth(), end.getDate() - numberOfDays + index + 1);
    const dayEnd = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate(), 23, 59, 59, 999).getTime();
    const label = `${String(currentDay.getDate()).padStart(2, "0")}/${String(currentDay.getMonth() + 1).padStart(2, "0")}`;
    if (dayEnd < firstEvent && localDateValue(currentDay) !== localDateValue(today)) {
      return { day: label, total: null };
    }
    const subsequentDelta = datedMovements
      .filter((movement) => movement.timestamp > dayEnd)
      .reduce((sum, movement) => sum + movement.delta, 0);
    return { day: label, total: currentUnits - subsequentDelta };
  });
}
const money = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const emptyProductForm = {
  name: "",
  sku: "",
  category: "Brinquedos",
  stock: "0",
  minimum: "5",
  price: "0",
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}
function App() {
  const [page, setPage] = useState<Page>("Dashboard");
  const [products, setProducts] = useState<Product[]>(() =>
    loadFromStorage<Product[]>("autostock-products", initialProducts),
  );
  const [movements, setMovements] = useState<Movement[]>(() =>
    loadFromStorage<Movement[]>("autostock-movements", initialMovements),
  );
  useEffect(() => {
    localStorage.setItem("autostock-products", JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    localStorage.setItem("autostock-movements", JSON.stringify(movements));
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
        </div>
      </main>

      {modal === "view-product" && selectedProduct && (
        <Modal
          title="Detalhes do produto"
          subtitle="Consulte as informações do item selecionado."
          onClose={() => setModal(null)}
        >
          <div className="form-grid">
            {[
              ["Identificador", String(selectedProduct.id)],
              ["Nome", selectedProduct.name],
              ["SKU", selectedProduct.sku],
              ["Categoria", selectedProduct.category],
              ["Quantidade", `${selectedProduct.stock} un.`],
              ["Estoque mínimo", `${selectedProduct.minimum} un.`],
              ["Preço unitário", money(selectedProduct.price)],
              ["Situação", selectedProduct.status],
            ].map(([label, value]) => (
              <div className="field" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>
                Fechar
              </button>
              <button className="btn btn-primary" onClick={() => openProductForm(selectedProduct)}>
                <Pencil size={16} /> Editar produto
              </button>
            </div>
          </div>
        </Modal>
      )}
      {(modal === "product" || modal === "edit-product") && (
        <Modal
          title={modal === "edit-product" ? "Editar produto" : "Cadastrar produto"}
          subtitle={modal === "edit-product" ? "Atualize os dados cadastrais do item." : "Adicione um novo item ao catálogo."}
          onClose={() => setModal(null)}
        >
          <form onSubmit={saveProduct} className="form-grid">
            <Field label="Nome do produto">
              <input
                required
                value={productForm.name}
                onChange={(e) =>
                  setProductForm({ ...productForm, name: e.target.value })
                }
                placeholder="Ex.: Jogo educativo"
              />
            </Field>
            <Field label="SKU">
              <input
                required
                value={productForm.sku}
                onChange={(e) =>
                  setProductForm({ ...productForm, sku: e.target.value })
                }
                placeholder="Ex.: JOG-001"
              />
            </Field>
            <Field label="Categoria">
              <select
                value={productForm.category}
                onChange={(e) =>
                  setProductForm({ ...productForm, category: e.target.value })
                }
              >
                <option>Brinquedos</option>
                <option>Jogos</option>
                <option>Pelúcias</option>
                <option>Brinquedos educativos</option>
                <option>Educativos</option>
              </select>
            </Field>
            <Field label={modal === "edit-product" ? "Saldo atual (somente leitura)" : "Quantidade inicial"}>
              <input
                type="number"
                min="0"
                required
                readOnly={modal === "edit-product"}
                value={productForm.stock}
                onChange={(e) =>
                  setProductForm({ ...productForm, stock: e.target.value })
                }
              />
            </Field>
            {modal === "edit-product" && (
              <div className="info-note">
                <ShieldCheck size={17} /> Altere o saldo somente em Movimentações para preservar o histórico.
              </div>
            )}
            <Field label="Estoque mínimo">
              <input
                type="number"
                min="0"
                required
                value={productForm.minimum}
                onChange={(e) =>
                  setProductForm({ ...productForm, minimum: e.target.value })
                }
              />
            </Field>
            <Field label="Preço unitário (R$)">
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={productForm.price}
                onChange={(e) =>
                  setProductForm({ ...productForm, price: e.target.value })
                }
              />
            </Field>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setModal(null)}
              >
                Cancelar
              </button>
              <button className="btn btn-primary">
                <Check size={16} /> {modal === "edit-product" ? "Salvar alterações" : "Salvar produto"}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {modal === "movement" && (
        <Modal
          title="Nova movimentação"
          subtitle="Registre uma entrada ou saída de estoque."
          onClose={() => setModal(null)}
        >
          <form onSubmit={saveMovement} className="form-grid">
            <Field label="Produto">
              <select
                value={movementForm.productId}
                onChange={(e) =>
                  setMovementForm({ ...movementForm, productId: e.target.value })
                }
              >
                {products.map((p) => (
                  <option key={p.id} value={String(p.id)}>{p.name} — {p.sku}</option>
                ))}
              </select>
            </Field>
            <Field label="Tipo de movimentação">
              <select
                value={movementForm.type}
                onChange={(e) =>
                  setMovementForm({ ...movementForm, type: e.target.value })
                }
              >
                <option>Entrada</option>
                <option>Saída</option>
              </select>
            </Field>
            <Field label="Quantidade">
              <input
                type="number"
                min="1"
                required
                value={movementForm.quantity}
                onChange={(e) =>
                  setMovementForm({ ...movementForm, quantity: e.target.value })
                }
              />
            </Field>
            <div className="info-note">
              <ShieldCheck size={17} /> Validação demonstrativa no frontend. As
              regras definitivas serão aplicadas pela API.
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setModal(null)}
              >
                Cancelar
              </button>
              <button className="btn btn-primary">
                <Check size={16} /> Confirmar
              </button>
            </div>
          </form>
        </Modal>
      )}
      {modal === "correction" && selectedMovement && (
        <Modal
          title="Corrigir lançamento"
          subtitle="Ajuste uma entrada registrada incorretamente."
          onClose={() => setModal(null)}
        >
          <form onSubmit={saveCorrection} className="form-grid">
            <div className="correction-summary">
              <span>Movimentação original #{selectedMovement.id}</span>
              <b>{selectedMovement.product}</b>
              <small>
                Quantidade originalmente lançada:{" "}
                <strong>{Math.abs(selectedMovement.quantity)} un.</strong>
              </small>
            </div>
            <Field label="Quantidade correta">
              <input
                type="number"
                min="0"
                required
                value={correctionForm.quantity}
                onChange={(e) =>
                  setCorrectionForm({
                    ...correctionForm,
                    quantity: e.target.value,
                  })
                }
              />
            </Field>
            <Field label="Justificativa obrigatória">
              <textarea
                required
                rows={3}
                value={correctionForm.reason}
                onChange={(e) =>
                  setCorrectionForm({
                    ...correctionForm,
                    reason: e.target.value,
                  })
                }
                placeholder="Explique o motivo da correção..."
              />
            </Field>
            <div className="projection">
              <div>
                <small>Diferença</small>
                <b>
                  {correctionForm.quantity === ""
                    ? "—"
                    : `${Number(correctionForm.quantity) - Math.abs(selectedMovement.quantity) > 0 ? "+" : ""}${Number(correctionForm.quantity) - Math.abs(selectedMovement.quantity)} un.`}
                </b>
              </div>
              <div>
                <small>Saldo projetado</small>
                <b>
                  {correctionForm.quantity === ""
                    ? "—"
                    : correctingProduct
                      ? `${correctingProduct.stock + Number(correctionForm.quantity) - Math.abs(selectedMovement.quantity)} un.`
                      : "Produto não identificado"}
                </b>
              </div>
            </div>
            <div className="info-note">
              <AlertTriangle size={17} /> A correção será registrada como um
              novo evento, preservando o lançamento original.
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setModal(null)}
              >
                Cancelar
              </button>
              <button className="btn btn-primary">
                <Check size={16} /> Confirmar correção
              </button>
            </div>
          </form>
        </Modal>
      )}
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

function Login({ onLogin }: { onLogin: () => void }) {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-mark">
            <Package size={32} />
          </div>
          <div className="brand-name">
            Auto<span>Stock</span>
          </div>
        </div>
        <p className="eyebrow">GESTÃO INTELIGENTE DE ESTOQUE</p>
        <h1>Bem-vindo de volta</h1>
        <p className="muted">Entre na sua conta para continuar.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!user || !password) setError("Preencha seu usuário e senha.");
            else onLogin();
          }}
        >
          <Field label="Identificação">
            <input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="Seu usuário ou e-mail"
            />
          </Field>
          <Field label="Senha">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
            />
          </Field>
          {error && <p className="error-text">{error}</p>}
          <button className="btn btn-primary login-submit">
            Entrar <ArrowRight size={17} />
          </button>
        </form>
        <small className="login-demo">
          Ambiente demonstrativo • autenticação fictícia
        </small>
      </div>
    </div>
  );
}

function Dashboard({
  products,
  movements,
  low,
  empty,
  totalUnits,
  stockValue,
  period,
  setPeriod,
  referenceDate,
  setReferenceDate,
  onGo,
  onAdd,
  onMovement,
  onImport,
  onCorrect,
}: {
  products: Product[];
  movements: Movement[];
  low: number;
  empty: number;
  totalUnits: number;
  stockValue: number;
  period: string;
  setPeriod: (value: string) => void;
  referenceDate: string;
  setReferenceDate: (value: string) => void;
  onGo: (page: Page) => void;
  onAdd: () => void;
  onMovement: () => void;
  onImport: () => void;
  onCorrect: (movement: Movement) => void;
}) {
  const historyData = useMemo(
    () => buildStockHistory(products, movements, period, referenceDate),
    [products, movements, period, referenceDate],
  );
  const pieData = [
    {
      name: "Em estoque",
      value: Math.max(0, products.length - low - empty),
      color: "#35d36b",
    },
    { name: "Abaixo do mínimo", value: low, color: "#f2c94c" },
    { name: "Sem estoque", value: empty, color: "#777980" },
  ];
  const alerts = products.filter((p: Product) => p.status !== "Em estoque");
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">VISÃO GERAL</p>
          <h1>
            Olá, Ikaro! <span className="wave">👋</span>
          </h1>
          <p className="muted">Aqui está o resumo do seu estoque hoje.</p>
        </div>
        <label className="date-chip" title="Data final da análise de evolução do estoque">
          <CalendarDays size={17} />
          <span>Até</span>
          <input
            aria-label="Data final da análise de evolução do estoque"
            type="date"
            value={referenceDate}
            max={localDateValue(new Date())}
            onChange={(e) => setReferenceDate(e.target.value)}
            style={{ background: "transparent", color: "inherit", border: 0, colorScheme: "dark", font: "inherit" }}
          />
        </label>
      </div>
      <div className="stats-grid">
        <Stat
          icon={<Package />}
          label="Total de Produtos"
          value={String(products.length)}
          trend="Cadastros atuais"
        />
        <Stat
          icon={<Boxes />}
          label="Itens em Estoque"
          value={totalUnits.toLocaleString("pt-BR")}
          trend="Saldo atual"
        />
        <Stat
          icon={<AlertTriangle />}
          label="Abaixo do Mínimo"
          value={String(low)}
          trend="Situação atual"
        />
        <Stat
          icon={<TrendingUp />}
          label="Valor em Estoque"
          value={money(stockValue)}
          trend="Valor atual"
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel chart-panel">
          <div className="panel-heading">
            <div className="panel-title">
              <ChartNoAxesCombined className="gold-icon" />
              <div>
                <h3>Evolução do Estoque</h3>
                <small>Estimativa pelas movimentações registradas; dias sem histórico não são preenchidos</small>
              </div>
            </div>
            <select
              className="compact-select"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option>Últimos 7 dias</option>
              <option>Últimos 30 dias</option>
              <option>Últimos 90 dias</option>
            </select>
          </div>
          <div className="chart-wrap">
            {historyData.some((point) => point.total !== null) ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e9b84f" stopOpacity={0.35} />
                    <stop
                      offset="100%"
                      stopColor="#e9b84f"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="#303136"
                  strokeDasharray="3 4"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  stroke="#85868c"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <YAxis
                  stroke="#85868c"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <Tooltip
                  contentStyle={{
                    background: "#202124",
                    border: "1px solid #45464b",
                    borderRadius: 10,
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#e9b84f"
                  strokeWidth={2.5}
                  fill="url(#goldFill)"
                  activeDot={{ r: 5, fill: "#e9b84f" }}
                />
              </AreaChart>
            </ResponsiveContainer>
            ) : (
              <Empty text="Sem movimentações suficientes para analisar a data selecionada." />
            )}
          </div>
        </section>
        <section className="panel status-panel">
          <div className="panel-heading">
            <h3>Status do Estoque</h3>
          </div>
          <div className="donut-layout">
            <div className="donut">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    innerRadius="69%"
                    outerRadius="91%"
                    paddingAngle={3}
                    stroke="none"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <b>{products.length}</b>
                <small>Produtos</small>
              </div>
            </div>
            <div className="legend">
              {pieData.map((d) => (
                <div key={d.name}>
                  <i style={{ background: d.color }} />
                  <span>{d.name}</span>
                  <b>
                    {Math.round((d.value / Math.max(1, products.length)) * 100)}
                    %
                  </b>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="panel alerts-panel">
          <div className="panel-heading">
            <div className="panel-title">
              <AlertTriangle className="gold-icon" />
              <h3>Alertas de Estoque</h3>
            </div>
            <button className="text-link" onClick={() => onGo("Estoque")}>
              Ver todos <ArrowRight size={14} />
            </button>
          </div>
          <div className="alert-list">
            {alerts.slice(0, 4).map((p: Product) => (
              <div className="alert-row" key={p.id}>
                <span className="alert-product-icon">
                  <Package size={17} />
                </span>
                <div className="alert-copy">
                  <b>{p.name}</b>
                  <small>
                    Estoque: {p.stock} | Mínimo: {p.minimum}
                  </small>
                </div>
                <span className="alert-count">{p.stock} un</span>
              </div>
            ))}
            {alerts.length === 0 && <Empty text="Nenhum alerta de estoque." />}
          </div>
        </section>
        <section className="panel recent-panel">
          <div className="panel-heading">
            <div className="panel-title">
              <ArrowLeftRight className="gold-icon" />
              <h3>Movimentações Recentes</h3>
            </div>
            <button className="text-link" onClick={() => onGo("Movimentações")}>
              Ver histórico <ArrowRight size={14} />
            </button>
          </div>
          <MovementTable
            movements={movements.slice(0, 4)}
            compact
            onCorrect={onCorrect}
          />
        </section>
        <section className="panel quick-panel">
          <div className="panel-heading">
            <div className="panel-title">
              <Zap className="gold-icon" />
              <h3>Ações Rápidas</h3>
            </div>
          </div>
          <div className="quick-grid">
            <button className="quick-action primary" onClick={onAdd}>
              <Plus />
              <b>Cadastrar Produto</b>
            </button>
            <button className="quick-action" onClick={onMovement}>
              <ArrowLeftRight />
              <b>Nova Movimentação</b>
            </button>
            <button className="quick-action" onClick={onImport}>
              <CloudUpload />
              <b>Importar Planilha</b>
            </button>
            <button className="quick-action" onClick={() => onGo("Relatórios")}>
              <Download />
              <b>Exportar Estoque (CSV)</b>
            </button>
          </div>
        </section>
      </div>
      <div className="demo-footnote">
        <span className="demo-dot" /> Dados demonstrativos fictícios •
        preparados para integração com a API FastAPI
      </div>
    </>
  );
}
function Stat({
  icon,
  label,
  value,
  trend,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  trend: string;
  positive?: boolean;
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <span>{label}</span>
        <strong>{value}</strong>
        <small className={positive === undefined ? "muted" : positive ? "trend-up" : "trend-down"}>
          {positive === undefined ? "" : positive ? "▲ " : "▼ "}{trend}
        </small>
      </div>
    </div>
  );
}
function ProductsPage({
  products,
  query,
  setQuery,
  clearGlobalQuery,
  category,
  setCategory,
  status,
  setStatus,
  onAdd,
  onView,
  onEdit,
}: {
  products: Product[];
  query: string;
  setQuery: (value: string) => void;
  clearGlobalQuery: () => void;
  category: string;
  setCategory: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  onAdd: () => void;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
}) {
  return (
    <>
      <PageHeader
        eyebrow="CATÁLOGO"
        title="Produtos"
        subtitle="Gerencie os produtos cadastrados no seu estoque."
        action={
          <button className="btn btn-primary" onClick={onAdd}>
            <Plus size={16} /> Cadastrar produto
          </button>
        }
      />
      <section className="panel table-panel">
        <div className="toolbar">
          <div className="filter-search">
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar por nome ou SKU..."
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Todas</option>
            {[
              "Brinquedos educativos",
              "Jogos",
              "Pelúcias",
              "Brinquedos",
              "Educativos",
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>Todas</option>
            <option>Em estoque</option>
            <option>Abaixo do mínimo</option>
            <option>Sem estoque</option>
          </select>
          <button
            className="btn btn-outline"
            onClick={() => {
              setQuery("");
              clearGlobalQuery();
              setCategory("Todas");
              setStatus("Todas");
            }}
          >
            <Filter size={15} /> Limpar
          </button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>SKU</th>
                <th>Categoria</th>
                <th>Quantidade</th>
                <th>Estoque mínimo</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: Product) => (
                <tr key={p.id}>
                  <td>
                    <div className="product-cell">
                      <span className="product-thumb">
                        <Package size={17} />
                      </span>
                      <b>{p.name}</b>
                    </div>
                  </td>
                  <td className="muted">{p.sku}</td>
                  <td>{p.category}</td>
                  <td>
                    <b>{p.stock} un.</b>
                  </td>
                  <td>{p.minimum} un.</td>
                  <td>
                    <Status status={p.status} />
                  </td>
                  <td>
                    <button
                      className="table-icon"
                      onClick={() => onView(p)}
                      aria-label={`Ver produto ${p.name} (${p.sku})`}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="table-icon"
                      onClick={() => onEdit(p)}
                      aria-label={`Editar produto ${p.name} (${p.sku})`}
                    >
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <Empty text="Nenhum produto encontrado com esses filtros." />
          )}
        </div>
        <div className="table-footer">
          Exibindo <b>{products.length}</b> produto(s) • Dados fictícios
        </div>
      </section>
    </>
  );
}
function StockPage({
  products,
  onMovement,
}: {
  products: Product[];
  onMovement: () => void;
}) {
  const total = products.reduce((s: number, p: Product) => s + p.stock, 0);
  return (
    <>
      <PageHeader
        eyebrow="CONTROLE OPERACIONAL"
        title="Estoque"
        subtitle="Acompanhe os níveis e identifique itens que precisam de reposição."
        action={
          <button className="btn btn-primary" onClick={onMovement}>
            <ArrowLeftRight size={16} /> Nova movimentação
          </button>
        }
      />
      <div className="mini-stats">
        <Stat
          icon={<Boxes />}
          label="Unidades monitoradas"
          value={total.toLocaleString("pt-BR")}
          trend="Saldo atual"
          positive
        />
        <Stat
          icon={<AlertTriangle />}
          label="Abaixo do mínimo"
          value={
            products.filter((p: Product) => p.stock > 0 && p.stock <= p.minimum)
              .length
          }
          trend="Requer atenção"
          positive={false}
        />
        <Stat
          icon={<Package />}
          label="Sem estoque"
          value={products.filter((p: Product) => p.stock === 0).length}
          trend="Reposição necessária"
          positive={false}
        />
      </div>
      <section className="panel table-panel">
        <div className="panel-heading">
          <h3>Níveis de estoque por produto</h3>
          <span className="muted">
            Acompanhamento em tempo real (demonstrativo)
          </span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Saldo atual</th>
                <th>Mínimo</th>
                <th>Nível</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: Product) => (
                <tr key={p.id}>
                  <td>
                    <b>{p.name}</b>
                    <small className="subline">{p.sku}</small>
                  </td>
                  <td>{p.stock} un.</td>
                  <td>{p.minimum} un.</td>
                  <td>
                    <div className="stock-bar">
                      <span
                        style={{
                          width: `${Math.min(100, (p.stock / Math.max(1, p.minimum * 2)) * 100)}%`,
                          background:
                            p.stock === 0
                              ? "#ef6464"
                              : p.stock <= p.minimum
                                ? "#e9b84f"
                                : "#35d36b",
                        }}
                      />
                    </div>
                  </td>
                  <td>
                    <Status status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
function MovementsPage({
  movements,
  onAdd,
  onCorrect,
}: {
  movements: Movement[];
  onAdd: () => void;
  onCorrect: (m: Movement) => void;
}) {
  const [filter, setFilter] = useState("Todas");
  const rows = movements.filter(
    (m: Movement) => filter === "Todas" || m.type === filter,
  );
  const correctedMovementIds = new Set(
    movements.filter((movement) => movement.correctionOf !== undefined)
      .map((movement) => movement.correctionOf),
  );
  return (
    <>
      <PageHeader
        eyebrow="HISTÓRICO OPERACIONAL"
        title="Movimentações"
        subtitle="Registre e consulte entradas, saídas e correções de estoque."
        action={
          <button className="btn btn-primary" onClick={onAdd}>
            <Plus size={16} /> Nova movimentação
          </button>
        }
      />
      <section className="panel table-panel">
        <div className="toolbar">
          <div>
            <h3>Histórico de movimentações</h3>
            <small className="muted">
              Consulte os lançamentos e suas alterações.
            </small>
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>Todas</option>
            <option>Entrada</option>
            <option>Saída</option>
            <option>Correção</option>
          </select>
        </div>
        <div className="table-scroll">
          <MovementTable movements={rows} onCorrect={onCorrect} correctedMovementIds={correctedMovementIds} />
        </div>
        <div className="table-footer">
          Correções são registradas como novos eventos; o lançamento original é
          preservado.
        </div>
      </section>
    </>
  );
}
function MovementTable({
  movements,
  compact = false,
  onCorrect,
  correctedMovementIds,
}: {
  movements: Movement[];
  compact?: boolean;
  onCorrect: (movement: Movement) => void;
  correctedMovementIds?: Set<number | undefined>;
}) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Produto</th>
            <th>Tipo</th>
            <th>Quantidade</th>
            <th>Saldo anterior</th>
            <th>Saldo atual</th>
            <th>Data e Hora</th>
            {!compact && <th>Ação</th>}
          </tr>
        </thead>
        <tbody>
          {movements.map((m: Movement) => (
            <tr key={m.id}>
              <td>{m.id}</td>
              <td>
                <div className="product-cell">
                  <span className="tiny-product">
                    <Package size={14} />
                  </span>
                  <b>{m.product}</b>
                </div>
                {m.note && (
                  <small className="subline">Justificativa: {m.note}</small>
                )}
              </td>
              <td>
                <Status status={m.type} />
              </td>
              <td className={m.quantity < 0 ? "negative" : "positive"}>
                {m.quantity > 0 ? "+" : ""}
                {m.quantity}
              </td>
              <td>{m.before}</td>
              <td>{m.after}</td>
              <td className="nowrap">{m.date}</td>
              {!compact && (
                <td>
                  {m.type === "Entrada" && onCorrect && (
                    <button
                      className="btn btn-outline btn-small"
                      onClick={() => onCorrect(m)}
                      disabled={correctedMovementIds?.has(m.id)}
                    >
                      <RotateCcw size={14} /> {correctedMovementIds?.has(m.id) ? "Já corrigido" : "Corrigir lançamento"}
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {movements.length === 0 && (
        <Empty text="Nenhuma movimentação encontrada." />
      )}
    </div>
  );
}
function ReportsPage({
  products,
  totalUnits,
  stockValue,
}: {
  products: Product[];
  totalUnits: number;
  stockValue: number;
}) {
  const data = products.slice(0, 6).map((p: Product) => ({
    name: p.name.length > 16 ? p.name.slice(0, 16) + "…" : p.name,
    units: p.stock,
  }));
  return (
    <>
      <PageHeader
        eyebrow="INTELIGÊNCIA DE DADOS"
        title="Relatórios"
        subtitle="Indicadores e visão consolidada do seu estoque."
        action={
          <button
            className="btn btn-outline"
            onClick={() => {
              const csv = [
                "Produto,SKU,Estoque,Mínimo,Preço",
                ...products.map(
                  (p: Product) =>
                    `${p.name},${p.sku},${p.stock},${p.minimum},${p.price}`,
                ),
              ].join("\\n");
              const a = document.createElement("a");
              a.href = URL.createObjectURL(
                new Blob([csv], { type: "text/csv" }),
              );
              a.download = "autostock-relatorio.csv";
              a.click();
              URL.revokeObjectURL(a.href);
            }}
          >
            <Download size={16} /> Exportar CSV
          </button>
        }
      />
      <div className="mini-stats">
        <Stat
          icon={<Boxes />}
          label="Unidades totais"
          value={totalUnits.toLocaleString("pt-BR")}
          trend="Consolidado"
          positive
        />
        <Stat
          icon={<TrendingUp />}
          label="Valor estimado"
          value={money(stockValue)}
          trend="Valor de referência"
          positive
        />
        <Stat
          icon={<Package />}
          label="Produtos cadastrados"
          value={products.length}
          trend="Catálogo ativo"
          positive
        />
      </div>
      <div className="report-grid">
        <section className="panel">
          <div className="panel-heading">
            <h3>Unidades por produto</h3>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid stroke="#303136" strokeDasharray="3 4" />
                <XAxis dataKey="name" stroke="#85868c" fontSize={10} />
                <YAxis stroke="#85868c" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "#202124",
                    border: "1px solid #45464b",
                    borderRadius: 10,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="units"
                  stroke="#e9b84f"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="panel forecast-panel">
          <Sparkles size={23} className="gold-icon" />
          <h3>Previsão de demanda</h3>
          <p className="muted">
            Área reservada para os indicadores preditivos de demanda que serão
            desenvolvidos na AS-08.
          </p>
          <span className="status-pill pending">Em planejamento</span>
        </section>
      </div>
    </>
  );
}
function AutomationPage({ onToast }: { onToast: (message: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  return (
    <>
      <PageHeader
        eyebrow="PROCESSOS AUTOMATIZADOS"
        title="Automação e Alertas"
        subtitle="Acompanhe importações, sincronizações e eventos do estoque."
      />
      <div className="automation-grid">
        <section className="panel import-panel">
          <div className="panel-title">
            <FileSpreadsheet className="gold-icon" />
            <div>
              <h3>Importar planilha</h3>
              <small>Carregue arquivos CSV ou XLSX.</small>
            </div>
          </div>
          <label className="upload-zone">
            <CloudUpload size={31} />
            <b>
              {file
                ? file.name
                : "Arraste sua planilha ou clique para selecionar"}
            </b>
            <small>Formatos aceitos: .CSV e .XLSX</small>
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <button
            className="btn btn-primary"
            disabled={!file}
            onClick={() =>
              onToast(
                "Arquivo selecionado. O processamento real será integrado na AS-06.",
              )
            }
          >
            Enviar para processamento
          </button>
          <p className="muted tiny-note">
            Demonstração visual: o arquivo não será enviado a um servidor.
          </p>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h3>Status das sincronizações</h3>
            <span className="status-pill pending">Preparado</span>
          </div>
          <div className="sync-row">
            <span className="sync-icon">
              <CloudUpload />
            </span>
            <div>
              <b>Importação de produtos</b>
              <small>Aguardando integração com API</small>
            </div>
            <span className="muted">—</span>
          </div>
          <div className="sync-row">
            <span className="sync-icon">
              <Activity />
            </span>
            <div>
              <b>Sincronização de estoque</b>
              <small>Aguardando integração com API</small>
            </div>
            <span className="muted">—</span>
          </div>
          <div className="sync-row">
            <span className="sync-icon">
              <ClipboardList />
            </span>
            <div>
              <b>Eventos processados</b>
              <small>Histórico demonstrativo</small>
            </div>
            <span className="muted">0</span>
          </div>
        </section>
      </div>
      <section className="panel table-panel automation-events">
        <div className="panel-heading">
          <h3>Monitoramento de eventos</h3>
          <button
            className="text-link"
            onClick={() =>
              onToast("Nenhuma falha registrada no ambiente demonstrativo.")
            }
          >
            Ver exceções <ArrowRight size={14} />
          </button>
        </div>
        <Empty text="Nenhum evento processado até o momento. Os eventos aparecerão aqui após a integração da AS-06." />
      </section>
    </>
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
function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
function Modal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section className="modal">
        <div className="modal-heading">
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar">
            <X />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
function Status({ status }: { status: string }) {
  const cls =
    status === "Entrada"
      ? "good"
      : status === "Saída"
        ? "bad"
        : status === "Correção"
          ? "info"
          : status === "Em estoque"
            ? "good"
            : status === "Abaixo do mínimo"
              ? "warning"
              : "bad";
  return <span className={`status-pill ${cls}`}>{status}</span>;
}
function Empty({ text }: { text: string }) {
  return (
    <div className="empty-state">
      <Package size={25} />
      <span>{text}</span>
    </div>
  );
}

export default App;
