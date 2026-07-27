import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: number;
  clientCode: string;
  clientName: string;
  phoneNumber: string;
  createdAt: string;
}

export default function ManageClients() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [clients, setClients] = useState<Client[]>([]);
  const [clientCode, setClientCode] = useState("");
  const [clientName, setClientName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  if (user?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="text-center text-red-600 font-semibold">
          Access Denied
        </div>
      </DashboardLayout>
    );
  }

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (error) {
      console.error("Failed to fetch clients", error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleAddClient = async () => {
    if (!clientCode || !clientName || !phoneNumber) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          clientCode, 
          clientName, 
          phoneNumber, 
          role: user?.role 
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add client");
      }

      toast({
        title: "Client Added",
        description: `${clientName} added successfully`,
      });

      setClientCode("");
      setClientName("");
      setPhoneNumber("");

      fetchClients();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Manage Clients</h1>

        <Card>
          <CardHeader>
            <CardTitle>Add New Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input 
              placeholder="Client Code (Unique)" 
              value={clientCode} 
              onChange={e => setClientCode(e.target.value)} 
            />
            <Input 
              placeholder="Client Name" 
              value={clientName} 
              onChange={e => setClientName(e.target.value)} 
            />
            <Input 
              placeholder="Phone Number" 
              value={phoneNumber} 
              onChange={e => setPhoneNumber(e.target.value)} 
            />
            <Button onClick={handleAddClient}>Add Client</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Clients</CardTitle>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <div className="text-muted-foreground text-center py-4">
                No clients found.
              </div>
            ) : (
              <div className="space-y-2">
                {clients.map(c => (
                  <div key={c.id} className="flex justify-between items-center border p-4 rounded-lg">
                    <div>
                      <div className="font-semibold text-lg">{c.clientName}</div>
                      <div className="text-sm text-muted-foreground">Code: {c.clientCode}</div>
                    </div>
                    <div className="text-sm font-medium">
                      Phone: {c.phoneNumber}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
