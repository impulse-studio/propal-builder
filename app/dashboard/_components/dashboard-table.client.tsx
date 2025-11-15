"use client";

import {
  RiArrowDownSFill,
  RiArrowUpSFill,
  RiCheckboxCircleFill,
  RiExpandUpDownFill,
  RiMore2Line,
} from "@remixicon/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import * as Button from "@/components/ui/button";
import * as FileFormatIcon from "@/components/ui/file-format-icon";
import * as StatusBadge from "@/components/ui/status-badge";
import * as Table from "@/components/ui/table";
import { orpc } from "@/orpc/client";

type Propal = {
  id: string;
  titre: string;
  dateCreation: Date;
  dateModification: Date;
};

const getSortingIcon = (state: "asc" | "desc" | false) => {
  if (state === "asc")
    return <RiArrowUpSFill className="size-5 text-text-sub-600" />;
  if (state === "desc")
    return <RiArrowDownSFill className="size-5 text-text-sub-600" />;
  return <RiExpandUpDownFill className="size-5 text-text-sub-600" />;
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const formatRelativeDate = (date: Date) => {
  const now = new Date();
  const diffInMs = now.getTime() - new Date(date).getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Aujourd'hui";
  if (diffInDays === 1) return "Hier";
  if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
  if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`;
  if (diffInDays < 365) return `Il y a ${Math.floor(diffInDays / 30)} mois`;
  return `Il y a ${Math.floor(diffInDays / 365)} ans`;
};

export function DashboardTable() {
  const { data: propals } = useSuspenseQuery(
    orpc.propal.getPropals.queryOptions(),
  );
  const router = useRouter();

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns: ColumnDef<Propal>[] = React.useMemo(
    () => [
      {
        id: "titre",
        accessorKey: "titre",
        header: ({ column }) => (
          <div className="flex items-center gap-0.5">
            Titre
            <button
              type="button"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {getSortingIcon(column.getIsSorted())}
            </button>
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <FileFormatIcon.Root format="PDF" size="small" color="red" />
            <div className="flex flex-col gap-0.5">
              <span className="text-label-sm text-text-strong-950">
                {row.original.titre}
              </span>
              <span className="text-paragraph-xs text-text-sub-600">
                Proposition commerciale
              </span>
            </div>
          </div>
        ),
      },
      {
        id: "dateCreation",
        accessorKey: "dateCreation",
        header: ({ column }) => (
          <div className="flex min-w-36 items-center gap-0.5">
            Date de création
            <button
              type="button"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {getSortingIcon(column.getIsSorted())}
            </button>
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-label-sm text-text-strong-950">
              {formatDate(row.original.dateCreation)}
            </span>
            <span className="text-paragraph-xs text-text-sub-600">
              {formatRelativeDate(row.original.dateCreation)}
            </span>
          </div>
        ),
      },
      {
        id: "dateModification",
        accessorKey: "dateModification",
        header: ({ column }) => (
          <div className="flex min-w-36 items-center gap-0.5">
            Dernière modification
            <button
              type="button"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {getSortingIcon(column.getIsSorted())}
            </button>
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-label-sm text-text-strong-950">
              {formatDate(row.original.dateModification)}
            </span>
            <span className="text-paragraph-xs text-text-sub-600">
              {formatRelativeDate(row.original.dateModification)}
            </span>
          </div>
        ),
      },
      {
        id: "status",
        header: "Statut",
        cell: () => (
          <StatusBadge.Root status="completed" variant="light">
            <StatusBadge.Icon as={RiCheckboxCircleFill} />
            Actif
          </StatusBadge.Root>
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => (
          <Button.Root
            variant="neutral"
            mode="ghost"
            size="xsmall"
            asChild
            onClick={(e) => e.stopPropagation()}
          >
            <Link href={`/dashboard/propal/${row.original.id}`}>
              <Button.Icon as={RiMore2Line} />
            </Link>
          </Button.Root>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: propals as Propal[],
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    initialState: {
      sorting: [
        {
          id: "dateModification",
          desc: true,
        },
      ],
    },
  });

  return (
    <div className="mx-auto w-full max-w-[1104px]">
      <Table.Root>
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Table.Head key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </Table.Head>
              ))}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body>
          {table.getRowModel().rows?.length > 0 ? (
            table.getRowModel().rows.map((row, i, arr) => (
              <React.Fragment key={row.id}>
                <Table.Row
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer"
                  onClick={() =>
                    router.push(`/dashboard/propal/${row.original.id}`)
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <Table.Cell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </Table.Cell>
                  ))}
                </Table.Row>
                {i < arr.length - 1 && <Table.RowDivider />}
              </React.Fragment>
            ))
          ) : (
            <Table.Row>
              <Table.Cell
                colSpan={columns.length}
                className="text-center text-text-sub-600"
              >
                Aucune proposition trouvée
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>
    </div>
  );
}
