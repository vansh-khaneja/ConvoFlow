'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui-kit/card';
import { Button } from '@/components/ui-kit/button';
import { Input } from '@/components/ui-kit/input';
import { Label } from '@/components/ui-kit/label';

interface WelcomeFormProps {
  onSubmit: (name: string) => void;
}

export function WelcomeForm({ onSubmit }: WelcomeFormProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-[var(--background)] flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="w-full mx-auto">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo_with_boundary.png" alt="Convo Flow" className="h-24 w-auto object-contain" />
            </div>
            <CardTitle className="text-2xl">Welcome to Convo Flow!</CardTitle>
            <CardDescription>Let&apos;s get started with your chatbot builder</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">First Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your first name"
                  autoFocus
                  className="mt-1.5"
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Get Started
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

