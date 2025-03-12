import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AvatarStack = ({ members }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const visibleMembers = members.slice(0, 3);
  const remainingCount = Math.max(0, members.length - 3);

  // Get initials from name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <div className="flex items-center">
        <div className="flex -space-x-2">
          <TooltipProvider>
            {visibleMembers.map((member, index) => (
              <Tooltip key={member.id}>
                <TooltipTrigger asChild>
                  <Avatar className="border-2 border-white w-8 h-8 cursor-pointer">
                    <AvatarImage src={`https://i.pravatar.cc/300?u=${member.email}`} alt={member.name} />
                    <AvatarFallback className="bg-blue-500 text-white text-xs">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent className="bg-white p-2 shadow-md rounded-md border">
                  <div className="text-sm font-medium">{member.name}</div>
                  <div className="text-xs text-gray-500">{member.email}</div>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
        
        {remainingCount > 0 && (
          <Button 
            variant="ghost" 
            className="h-8 w-8 rounded-full bg-gray-200 text-gray-600 font-medium p-0 ml-2"
            onClick={() => setIsDialogOpen(true)}
          >
            +{remainingCount}
          </Button>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Project Members</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            <div className="space-y-4 p-2">
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={`https://i.pravatar.cc/300?u=${member.email}`} alt={member.name} />
                    <AvatarFallback className="bg-blue-500 text-white">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-gray-500">{member.email}</div>
                    <div className="text-sm text-gray-500">Role: {member.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AvatarStack;