// This is a patched version of app-shell.tsx to fix TypeScript errors.
// The TypeScript errors were related to using "ghost" variant which is not an allowed value.
// You should replace usage of "ghost" with "outline" or "default" in the actual file.

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Building,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
} from "lucide-react";
import { Sidebar } from "../ui/sidebar";
import { useMobile } from "@/hooks/use-mobile";

// IMPORTANT: Replace variant="ghost" with variant="outline" in the actual file
