import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Heading,
  Card,
  CardBody,
  Button,
  Grid,
  Icon,
} from '@chakra-ui/react';
import {
  FiUsers,
  FiCalendar,
  FiAward,
  FiSettings,
  FiDownload,
} from 'react-icons/fi';

interface QuickAction {
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  onClick: () => void;
}

interface AdminQuickActionsProps {
  quickActions: QuickAction[];
  cardBg: string;
  borderColor: string;
}

const AdminQuickActions: React.FC<AdminQuickActionsProps> = ({
  quickActions,
  cardBg,
  borderColor,
}) => {
  return (
    <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Heading size="md" color="white">
            Quick Actions
          </Heading>

          <Grid
            templateColumns={{
              base: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            }}
            gap={4}
          >
            {quickActions.map((action, index) => (
              <Button
                key={index}
                leftIcon={<Icon as={action.icon} />}
                colorScheme={action.color}
                variant="outline"
                size="lg"
                h="auto"
                p={4}
                flexDirection="column"
                onClick={action.onClick}
              >
                <Text fontSize="sm" fontWeight="bold">
                  {action.label}
                </Text>
                <Text fontSize="xs" color="gray.400">
                  {action.description}
                </Text>
              </Button>
            ))}
          </Grid>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default AdminQuickActions;
