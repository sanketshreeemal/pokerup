import { Button as ChakraButton, ButtonProps } from '@chakra-ui/react';

interface CustomButtonProps extends ButtonProps {
  variant?: 'solid' | 'outline';
}

export const Button = ({ children, variant = 'solid', ...props }: CustomButtonProps) => {
  return (
    <ChakraButton
      variant={variant}
      colorScheme="blue"
      size="md"
      {...props}
    >
      {children}
    </ChakraButton>
  );
}; 