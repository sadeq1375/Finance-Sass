import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const AccountsPage = () => {
  return (
    <div>
      <Card className="border-none shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle>Account Page</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
};

export default AccountsPage;
