import os

BASE_ML_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def test_diretorios_pipeline_ml_existem():
    pastas_esperadas = ["data", "preprocessing", "training", "inference"]
    for pasta in pastas_esperadas:
        caminho = os.path.join(BASE_ML_DIR, pasta)
        assert os.path.isdir(caminho), f"Pasta obrigatória de ML ausente: {pasta}"

def test_readme_ml_documentado():
    readme_path = os.path.join(BASE_ML_DIR, "README.md")
    assert os.path.isfile(readme_path), "README.md do módulo ML não encontrado"