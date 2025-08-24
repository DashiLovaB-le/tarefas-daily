import React, { useState } from 'react';
import { testDashiTaskTables, testDataInsertion } from '../test-database';

export const DatabaseTest: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [insertionResult, setInsertionResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTableTests = async () => {
    setLoading(true);
    try {
      const testResults = await testDashiTaskTables();
      setResults(testResults);
    } catch (error) {
      console.error('Erro nos testes:', error);
    }
    setLoading(false);
  };

  const runInsertionTest = async () => {
    setLoading(true);
    try {
      const result = await testDataInsertion();
      setInsertionResult(result);
    } catch (error) {
      console.error('Erro no teste de inserção:', error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Teste do Banco de Dados DashiTask</h1>
      
      <div className="space-y-4">
        <div>
          <button 
            onClick={runTableTests}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testando...' : 'Verificar Tabelas'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-lg font-semibold mb-3">Resultados dos Testes de Tabelas:</h2>
            {results.map((result, index) => (
              <div key={index} className={`p-2 mb-2 rounded ${
                result.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <strong>{result.table}:</strong> {result.message}
              </div>
            ))}
          </div>
        )}

        <div>
          <button 
            onClick={runInsertionTest}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Testando...' : 'Testar Inserção de Dados'}
          </button>
        </div>

        {insertionResult && (
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-lg font-semibold mb-3">Resultado do Teste de Inserção:</h2>
            <div className={`p-2 rounded ${
              insertionResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {insertionResult.message}
            </div>
            {insertionResult.data && (
              <div className="mt-3 text-sm">
                <pre className="bg-white p-2 rounded overflow-auto">
                  {JSON.stringify(insertionResult.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};