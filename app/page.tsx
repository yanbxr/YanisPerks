'use client';
import React, { Key, useEffect, useState } from "react";
import { getManifest } from "../components/get_perks";
import Image from 'next/image';

import Link from "next/link"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { LogIn } from "lucide-react"

import { siteConfig } from "@/config/site"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


interface Perk {
  hash: Key | null | undefined;
  displayProperties: {
    name: string;
    icon: string;
    description: string;
  };
  index: number;
  // Add other properties as needed
}

interface PerkTableProps {
  // Add any additional props if needed
}

function PerkTable({}: PerkTableProps) {
  const [perks, setPerks] = useState<Perk[]>([]);
  const [filteredPerks, setFilteredPerks] = useState<Perk[]>([]);
  const [filter, setFilter] = useState("");
  const [visiblePerks, setVisiblePerks] = useState(100);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Function to fetch data from the API
  async function fetchData() {
    const data = await getManifest();
    // Filter and sort perks by index
    const sortedPerks: Perk[] = Object.entries(data)
    .map(([key, perk]) => perk as Perk)
    .filter((perk) => isValidPerk(perk))
    .sort((a, b) => a.index - b.index);
  
  setPerks(sortedPerks);
  setFilteredPerks(sortedPerks);
  }

  // Function to check if a perk is valid based on your criteria
  const isValidPerk = (perk: Perk) => {
    return (
      perk &&
      perk.displayProperties &&
      perk.displayProperties.name &&
      perk.displayProperties.icon
    );
  };

  // Function to handle filtering based on the input
  const handleFilterChange = (event: { target: { value: string; }; }) => {
    const newFilter = event.target.value.toLowerCase();
    setFilter(newFilter);

    // Filter perks based on the new input
    const filteredData = perks.filter(
      (perk) =>
        perk.displayProperties.name.toLowerCase().includes(newFilter) ||
        perk.index.toString().includes(newFilter) ||
        perk.displayProperties.description.toLowerCase().includes(newFilter)
    );

    setFilteredPerks(filteredData);
    setVisiblePerks(100); // Reset visiblePerks to 100 when search is updated
  };

  // Function to handle loading more perks
  const handleLoadMore = () => {
    setVisiblePerks((prevVisiblePerks) => prevVisiblePerks + 100);
  };

  return (
    <section>
      <div className="flex w-full space-x-2 pb-5"></div>
      <Input
        min={100}
        onChange={handleFilterChange}
        placeholder="Filter by name, index, or description"
        className="mb-10"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell className="w-[100px]">Icon</TableCell>
            <TableCell className="w-[100px]">Index</TableCell>
            <TableCell className="w-[200px]">Name</TableCell>
            <TableCell>Description</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(filteredPerks)
            .slice(0, visiblePerks)
            .map(([key, perk]) => (
              <TableRow key={perk.hash}>
                <TableCell>
                  {perk.displayProperties?.icon && (
                    <img
                      src={`https://www.bungie.net/${perk.displayProperties.icon}`}
                      alt={`${perk.displayProperties.name} icon`}
                      className="w-8 h-8"
                    />
                  )}
                </TableCell>
                <TableCell className="font-medium">{perk.index}</TableCell>
                <TableCell>
                  {perk.displayProperties.name || "N/A"}
                </TableCell>
                <TableCell>
                  {perk.displayProperties.description || "N/A"}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      {visiblePerks < filteredPerks.length && (
        <div className="flex justify-center mt-4">
          <Button onClick={handleLoadMore}>Load more</Button>
        </div>
      )}
    </section>
  );
}


export default function IndexPage() {
  const titles = [
    "They",
    "hate",
    "me",
    ":("
    // Add more titles as needed
  ];

  let titleIndex = 0;

  // Function to update the page title
  const updatePageTitle = () => {
    const dynamicTitle = titles[titleIndex];
    document.title = dynamicTitle;

    // Move to the next title in the array (loop back to the beginning if reached the end)
    titleIndex = (titleIndex + 1) % titles.length;
  };

  // Set up an interval to update the title every second (1000 milliseconds)
  useEffect(() => {
    const titleUpdateInterval = setInterval(updatePageTitle, 1000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(titleUpdateInterval);
  }, []);
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          For all my YanisPasters <br className="hidden sm:inline" />
        </h1>
        <p className="max-w-[1000px] text-lg text-muted-foreground">
        Fast and efficient perk searcher for Destiny 2 enthusiasts, built with React and Next.js.
        </p>
      </div>
      <PerkTable></PerkTable>
    </section>
  )
}
