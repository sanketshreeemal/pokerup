import {
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormErrorMessage,
} from '@chakra-ui/react';

interface FormInputProps {
  label: string;
  type?: 'text' | 'number';
  error?: string;
  isRequired?: boolean;
  [key: string]: any;
}

export const FormInput = ({ label, type = 'text', error, isRequired, ...props }: FormInputProps) => {
  if (type === 'number') {
    return (
      <FormControl isInvalid={!!error} isRequired={isRequired}>
        <FormLabel>{label}</FormLabel>
        <NumberInput>
          <NumberInputField {...props} />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        {error && <FormErrorMessage>{error}</FormErrorMessage>}
      </FormControl>
    );
  }

  return (
    <FormControl isInvalid={!!error} isRequired={isRequired}>
      <FormLabel>{label}</FormLabel>
      <Input type={type} {...props} />
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
}; 