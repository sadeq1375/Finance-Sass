import { useOpenCategory } from "@/features/categories/hooks/use-open-categoory";

type Props = {
  id: string;
  category: string | null;
  categoryId: string | null;
};
export const CategoryColumn = ({ id, category, categoryId }: Props) => {
  const { onOpen: onOpenCategory } = useOpenCategory();
  const onClick = () => {
    if (categoryId) {
      onOpenCategory(categoryId);
    }
  };
  return (
    <div
      className="flex items-center cursor-pointer hover:underline"
      onClick={onClick}
    >
      {category || "UnCategorized"}
    </div>
  );
};
