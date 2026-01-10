import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { Client } from '@/types';
import { Search, Phone, User, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientSearchProps {
  onSelectClient: (client: Client) => void;
}

export default function ClientSearch({ onSelectClient }: ClientSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const { searchClients } = useData();

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.length >= 2) {
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
    if (selectedClient) {
      onSelectClient(selectedClient);
      setSelectedClient(null);
      setQuery('');
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
      <h2 className="text-lg font-semibold text-foreground mb-4">Search Client</h2>
      
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search by client name or code..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
        
        {/* Search Results Dropdown */}
        {results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto animate-scale-in">
            {results.map((client) => (
              <button
                key={client.clientCode}
                onClick={() => handleSelectClient(client)}
                className="w-full flex items-center gap-4 p-4 hover:bg-muted transition-colors text-left border-b border-border/50 last:border-0"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{client.clientName}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      {client.clientCode}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {client.phoneNumber}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Client Card */}
      {selectedClient && (
        <div className="mt-4 p-4 bg-accent/10 border border-accent/30 rounded-lg animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
                <User className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{selectedClient.clientName}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{selectedClient.clientCode}</span>
                  <span>{selectedClient.phoneNumber}</span>
                </div>
              </div>
            </div>
            <Button variant="accent" onClick={handleEnterData}>
              Enter Data
            </Button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {query.length >= 2 && results.length === 0 && !selectedClient && (
        <div className="mt-4 text-center py-8 text-muted-foreground">
          <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No clients found matching "{query}"</p>
        </div>
      )}
    </div>
  );
}
