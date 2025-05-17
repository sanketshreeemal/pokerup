"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UsernameDialogProps } from "@/types";

export function UsernameDialog({ isOpen, onClose, onSubmit }: UsernameDialogProps) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, onClose]);

  const handleSubmit = async () => {
    try {
      setError("");
      setIsLoading(true);
      await onSubmit(username);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "w-[90vw] max-w-sm",
        "bg-surface rounded-lg",
        "border-border",
        "p-4 md:p-6",
        "shadow-lg"
      )}>
        <DialogHeader>
          <DialogTitle className={cn(
            "text-xl md:text-2xl",
            "font-bold",
            "text-textPrimary"
          )}>
            Set up your game tag
          </DialogTitle>
        </DialogHeader>

        <div className={cn(
          "flex flex-col",
          "space-y-4",
          "py-4"
        )}>
          <div className="space-y-2">
            <Input
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              className={cn(
                "w-full",
                "bg-background/50",
                "border-border",
                "text-textPrimary",
                "placeholder:text-textSecondary",
                "focus:ring-primary focus:border-primary"
              )}
              disabled={isLoading}
            />
            <p className={cn(
              "text-xs md:text-sm",
              "text-textSecondary"
            )}>
              6-20 lowercase letters, numbers, underscores
            </p>
          </div>

          <div className="flex-grow" />

          {error && (
            <Alert variant="destructive" className={cn(
              "bg-error/10",
              "border-error/20",
              "p-3"
            )}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-error text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className={cn(
              "bg-success/10",
              "border-success/20",
              "p-3"
            )}>
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription className="text-success text-sm">
                Welcome to PokerUp {username}, let the games begin!
              </AlertDescription>
            </Alert>
          )}

            <Button 
            onClick={handleSubmit}
            disabled={isLoading || !username || username.trim().length < 6}
            className={cn(
                "w-full md:w-auto md:ml-auto",
                "bg-primary hover:bg-primaryVariant",
                isLoading || !username || username.trim().length < 6
                ? "text-textPrimary cursor-not-allowed"  
                : "text-white",
                "transition-colors"
            )}
            >
            {isLoading ? "Setting up..." : "Set Username"}
            </Button>

        </div>
      </DialogContent>
    </Dialog>
  );
} 