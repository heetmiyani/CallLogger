import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { Client } from '@/types';
import { Search, Phone, User, Hash } from 'lucide-react';

interface ClientSearchProps {
  onSelectClient: (client: Client) => void;
}

export default function ClientSearch({
  onSelectClient,
}: ClientSearchProps) {
  const { searchClients } = useData();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] =
    useState<Client | null>(null);

  const handleSearch = (value: string) => {
    setQuery(value);

    if (value.trim().length >= 2) {
      const found = searchClients(value);
      setResults(found);
    } else {
      setResults([]);
    }
  };

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setQuery(client.clientName);
    setResults([]);
  };

  const handleEnterData = () => {
    if (!selectedClient) return;

    onSelectClient(selectedClient);
    setSelectedClient(null);
    setQuery('');
  };

  return (
    <div className="bg-card rounded-xl p-6 border shadow-card">
      <h2 className="text-lg font-semibold mb-4">
        Search Client
      </h2>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search by name, code or phone..."
          value={query}
          onChange={e => handleSearch(e.target.value)}
        />

        {/* Results */}
        {results.length > 0 && (
          <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-card border rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {results.map(client => (
              <button
                key={client.clientCode}
                className="w-full p-4 text-left hover:bg-muted border-b last:border-0"
                onClick={() =>
                  handleSelectClient(client)
                }
              >
                <p className="font-medium">
                  {client.clientName}
                </p>
                <div className="text-xs text-muted-foreground flex gap-4">
                  <span>
                    <Hash className="inline w-3 h-3 mr-1" />
                    {client.clientCode}
                  </span>
                  <span>
                    <Phone className="inline w-3 h-3 mr-1" />
                    {client.phoneNumber}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Client */}
      {selectedClient && (
        <div className="mt-4 p-4 border rounded-lg bg-accent/10">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">
                {selectedClient.clientName}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedClient.clientCode} •{' '}
                {selectedClient.phoneNumber}
              </p>
            </div>
            <Button onClick={handleEnterData}>
              Enter Data
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {query.length >= 2 &&
        results.length === 0 &&
        !selectedClient && (
          <div className="mt-6 text-center text-muted-foreground">
            No clients found for "{query}"
          </div>
        )}
    </div>
  );
}
