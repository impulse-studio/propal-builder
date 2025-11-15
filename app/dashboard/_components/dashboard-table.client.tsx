"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";
import * as Table from "@/components/ui/table";
import { orpc } from "@/orpc/client";

export function DashboardTable() {
  const { data: propals } = useSuspenseQuery(
    orpc.propal.getPropals.queryOptions(),
  );

  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head>ID</Table.Head>
          <Table.Head>Name</Table.Head>
          <Table.Head>Description</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {propals.length === 0 ? (
          <Table.Row>
            <Table.Cell colSpan={3} className="text-center text-text-sub-600">
              No propals found
            </Table.Cell>
          </Table.Row>
        ) : (
          propals.map((propal) => (
            <Link href={`/dashboard/propal/${propal.id}`} key={propal.id}>
              <Table.Row key={propal.id}>
                <Table.Cell>{propal.id}</Table.Cell>
                <Table.Cell>{propal.titre}</Table.Cell>
              </Table.Row>
            </Link>
          ))
        )}
      </Table.Body>
    </Table.Root>
  );
}
