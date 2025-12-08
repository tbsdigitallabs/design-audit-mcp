import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function Dashboard() {
  return (
    <div className="container mx-auto p-4">
      <header className="mb-6">
        <h1 className="text-4xl font-bold">Dashboard</h1>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Card 1</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="default" size="lg">Action</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

