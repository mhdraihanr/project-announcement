"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";
import type { User } from "@/types";

interface TeamMembersProps {
  currentUser: User | null;
}

export default function TeamMembers({}: TeamMembersProps) {
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setIsLoading(true);
        // Fetch users with their roles
        const { data: users, error } = await supabase.from("users").select(`
            id, 
            name, 
            email, 
            role_id, 
            department, 
            position, 
            avatar_url, 
            created_at, 
            updated_at,
            roles:role_id (id, name, level, description)
          `);

        if (error) throw error;

        // Transform the data to match our User type
        const formattedUsers: User[] = users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role_id: user.role_id,
          role: user.roles
            ? Array.isArray(user.roles)
              ? user.roles[0]
              : user.roles
            : undefined,
          department: user.department,
          position: user.position,
          avatar_url: user.avatar_url,
          created_at: user.created_at,
          updated_at: user.updated_at,
        }));

        // Sort users by role level (ascending order - lower number means higher role)
        const sortedUsers = formattedUsers.sort((a, b) => {
          const levelA = a.role?.level || 999;
          const levelB = b.role?.level || 999;
          return levelA - levelB;
        });

        setTeamMembers(sortedUsers);
        setFilteredMembers(sortedUsers);
      } catch (error) {
        console.error("Error fetching team members:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMembers();
  }, [supabase]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMembers(teamMembers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = teamMembers.filter(
        (member) =>
          member.name.toLowerCase().includes(query) ||
          member.department.toLowerCase().includes(query) ||
          member.role?.name.toLowerCase().includes(query) ||
          (member.position && member.position.toLowerCase().includes(query))
      );
      setFilteredMembers(filtered);
    }
  }, [searchQuery, teamMembers]);

  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Function to get role badge variant based on role level
  const getRoleBadgeVariant = (level: number) => {
    switch (level) {
      case 1: // Administrator
        return "destructive";
      case 2: // Senior VP
        return "default";
      case 3: // VP
        return "secondary";
      case 4: // Officer
        return "outline";
      default: // Employee or others
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" /> Team Members
          </h1>
          <p className="text-muted-foreground mt-1">
            View all team members and their roles
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Members</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <CardDescription>
            Total {filteredMembers.length} team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <span className="text-muted-foreground">Loading members...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center h-24 text-muted-foreground"
                    >
                      No team members found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            {member.avatar_url ? (
                              <AvatarImage
                                src={member.avatar_url}
                                alt={member.name}
                              />
                            ) : (
                              <AvatarFallback>
                                {getInitials(member.name)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {member.role && (
                          <Badge
                            variant={getRoleBadgeVariant(member.role.level)}
                          >
                            {member.role.name}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{member.department}</TableCell>
                      <TableCell>{member.position || "-"}</TableCell>
                      <TableCell>{member.email}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
