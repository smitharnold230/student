import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Card,
  CardBody,
  Badge,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Icon,
} from '@chakra-ui/react';
import { FiCalendar, FiCode, FiCheckCircle, FiStar, FiTrendingUp, FiEdit } from 'react-icons/fi';
import { PointBreakdown, PointRule } from '../../types/points'; // Assuming types are defined

interface StudentDetailedBreakdownProps {
  breakdown: PointBreakdown | undefined;
  rules: PointRule[];
}

const StudentDetailedBreakdown: React.FC<StudentDetailedBreakdownProps> = ({ breakdown, rules }) => {
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  return (
    <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Heading size="md" color="white">
            Detailed Breakdown
          </Heading>
          
          <Accordion allowToggle>
            {/* Workshops */}
            {breakdown?.breakdown?.workshops && (
              <AccordionItem borderColor={borderColor}>
                <AccordionButton>
                  <HStack flex="1" justify="space-between">
                    <HStack>
                      <Icon as={FiCalendar} color="blue.500" />
                      <Text color="white" fontWeight="medium">
                        Workshops ({breakdown.breakdown.workshops.count})
                      </Text>
                    </HStack>
                    <HStack>
                      <Text color="green.400" fontWeight="bold">
                        +{breakdown.breakdown.workshops.points} pts
                      </Text>
                      <AccordionIcon color="gray.400" />
                    </HStack>
                  </HStack>
                </AccordionButton>
                <AccordionPanel>
                  <VStack align="stretch" spacing={2}>
                    {breakdown.breakdown.workshops.events.map((event, index) => (
                      <HStack key={index} justify="space-between" p={2} bg="gray.700" borderRadius="md">
                        <Text color="white" fontSize="sm">{event}</Text>
                        <Badge colorScheme="blue" variant="subtle">+{rules.find(r => r.key === 'WORKSHOP_PARTICIPATION')?.value || 50} pts</Badge>
                      </HStack>
                    ))}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            )}

            {/* Hackathons */}
            {breakdown?.breakdown?.hackathons && (
              <AccordionItem borderColor={borderColor}>
                <AccordionButton>
                  <HStack flex="1" justify="space-between">
                    <HStack>
                      <Icon as={FiCode} color="purple.500" />
                      <Text color="white" fontWeight="medium">
                        Hackathons ({breakdown.breakdown.hackathons.count})
                      </Text>
                    </HStack>
                    <HStack>
                      <Text color="green.400" fontWeight="bold">
                        +{breakdown.breakdown.hackathons.points} pts
                      </Text>
                      <AccordionIcon color="gray.400" />
                    </HStack>
                  </HStack>
                </AccordionButton>
                <AccordionPanel>
                  <VStack align="stretch" spacing={2}>
                    {breakdown.breakdown.hackathons.events.map((event, index) => (
                      <HStack key={index} justify="space-between" p={2} bg="gray.700" borderRadius="md">
                        <Text color="white" fontSize="sm">{event}</Text>
                        <Badge colorScheme="purple" variant="subtle">+{rules.find(r => r.key === 'HACKATHON_PARTICIPATION')?.value || 100} pts</Badge>
                      </HStack>
                    ))}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            )}

            {/* Certifications */}
            {breakdown?.breakdown?.certifications && (
              <AccordionItem borderColor={borderColor}>
                <AccordionButton>
                  <HStack flex="1" justify="space-between">
                    <HStack>
                      <Icon as={FiCheckCircle} color="green.500" />
                      <Text color="white" fontWeight="medium">
                        Certifications ({breakdown.breakdown.certifications.count})
                      </Text>
                    </HStack>
                    <HStack>
                      <Text color="green.400" fontWeight="bold">
                        +{breakdown.breakdown.certifications.points} pts
                      </Text>
                      <AccordionIcon color="gray.400" />
                    </HStack>
                  </HStack>
                </AccordionButton>
                <AccordionPanel>
                  <VStack align="stretch" spacing={2}>
                    {breakdown.breakdown.certifications.certifications.map((cert, index) => (
                      <HStack key={index} justify="space-between" p={2} bg="gray.700" borderRadius="md">
                        <Text color="white" fontSize="sm">{cert}</Text>
                        <Badge colorScheme="green" variant="subtle">+{rules.find(r => r.key === 'CERTIFICATION_APPROVED')?.value || 75} pts</Badge>
                      </HStack>
                    ))}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            )}

            {/* Coding Platforms */}
            {breakdown?.breakdown?.coding && (
              <AccordionItem borderColor={borderColor}>
                <AccordionButton>
                  <HStack flex="1" justify="space-between">
                    <HStack>
                      <Icon as={FiTrendingUp} color="orange.500" />
                      <Text color="white" fontWeight="medium">
                        Coding Platforms
                      </Text>
                    </HStack>
                    <HStack>
                      <Text color="green.400" fontWeight="bold">
                        +{breakdown.breakdown.coding.totalPoints} pts
                      </Text>
                      <AccordionIcon color="gray.400" />
                    </HStack>
                  </HStack>
                </AccordionButton>
                <AccordionPanel>
                  <VStack align="stretch" spacing={3}>
                    {breakdown.breakdown.coding.breakdown.leetcode && (
                      <Box p={3} bg="gray.700" borderRadius="md">
                        <HStack justify="space-between" mb={2}>
                          <Text color="white" fontWeight="medium">LeetCode</Text>
                          <Badge colorScheme="orange" variant="subtle">
                            +{breakdown.breakdown.coding.breakdown.leetcode.totalPoints} pts
                          </Badge>
                        </HStack>
                        <VStack align="stretch" spacing={1}>
                          <HStack justify="space-between">
                            <Text color="gray.400" fontSize="sm">Problems Solved</Text>
                            <Text color="white" fontSize="sm">
                              {breakdown.breakdown.coding.breakdown.leetcode.problemsSolved}
                            </Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text color="gray.400" fontSize="sm">Base Points</Text>
                            <Text color="white" fontSize="sm">
                              +{breakdown.breakdown.coding.breakdown.leetcode.basePoints}
                            </Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text color="gray.400" fontSize="sm">Bonus Points</Text>
                            <Text color="white" fontSize="sm">
                              +{breakdown.breakdown.coding.breakdown.leetcode.bonusPoints}
                            </Text>
                          </HStack>
                        </VStack>
                      </Box>
                    )}
                    
                    {breakdown.breakdown.coding.breakdown.hackerrank && (
                      <Box p={3} bg="gray.700" borderRadius="md">
                        <HStack justify="space-between" mb={2}>
                          <Text color="white" fontWeight="medium">HackerRank</Text>
                          <Badge colorScheme="orange" variant="subtle">
                            +{breakdown.breakdown.coding.breakdown.hackerrank.totalPoints} pts
                          </Badge>
                        </HStack>
                        <VStack align="stretch" spacing={1}>
                          <HStack justify="space-between">
                            <Text color="gray.400" fontSize="sm">Problems Solved</Text>
                            <Text color="white" fontSize="sm">
                              {breakdown.breakdown.coding.breakdown.hackerrank.problemsSolved}
                            </Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text color="gray.400" fontSize="sm">Base Points</Text>
                            <Text color="white" fontSize="sm">
                              +{breakdown.breakdown.coding.breakdown.hackerrank.basePoints}
                            </Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text color="gray.400" fontSize="sm">Bonus Points</Text>
                            <Text color="white" fontSize="sm">
                              +{breakdown.breakdown.coding.breakdown.hackerrank.bonusPoints}
                            </Text>
                          </HStack>
                        </VStack>
                      </Box>
                    )}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            )}

            {/* Bonuses */}
            {breakdown?.breakdown?.bonuses && breakdown.breakdown.bonuses.totalPoints > 0 && (
              <AccordionItem borderColor={borderColor}>
                <AccordionButton>
                  <HStack flex="1" justify="space-between">
                    <HStack>
                      <Icon as={FiStar} color="yellow.500" />
                      <Text color="white" fontWeight="medium">
                        Bonus Points
                      </Text>
                    </HStack>
                    <HStack>
                      <Text color="green.400" fontWeight="bold">
                        +{breakdown.breakdown.bonuses.totalPoints} pts
                      </Text>
                      <AccordionIcon color="gray.400" />
                    </HStack>
                  </HStack>
                </AccordionButton>
                <AccordionPanel>
                  <VStack align="stretch" spacing={2}>
                    {breakdown.breakdown.bonuses.breakdown.firstWorkshop && (
                      <HStack justify="space-between" p={2} bg="gray.700" borderRadius="md">
                        <Text color="white" fontSize="sm">First Workshop Bonus</Text>
                        <Badge colorScheme="yellow" variant="subtle">
                          +{breakdown.breakdown.bonuses.breakdown.firstWorkshop} pts
                        </Badge>
                      </HStack>
                    )}
                    {breakdown.breakdown.bonuses.breakdown.firstHackathon && (
                      <HStack justify="space-between" p={2} bg="gray.700" borderRadius="md">
                        <Text color="white" fontSize="sm">First Hackathon Bonus</Text>
                        <Badge colorScheme="yellow" variant="subtle">
                          +{breakdown.breakdown.bonuses.breakdown.firstHackathon} pts
                        </Badge>
                      </HStack>
                    )}
                    {breakdown.breakdown.bonuses.breakdown.certificationStreak && (
                      <HStack justify="space-between" p={2} bg="gray.700" borderRadius="md">
                        <Text color="white" fontSize="sm">Certification Streak Bonus</Text>
                        <Badge colorScheme="yellow" variant="subtle">
                          +{breakdown.breakdown.bonuses.breakdown.certificationStreak} pts
                        </Badge>
                      </HStack>
                    )}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            )}
            {breakdown?.manualAdjustment !== undefined && (
              <AccordionItem borderColor={borderColor}>
                <AccordionButton>
                  <HStack flex="1" justify="space-between">
                    <HStack>
                      <Icon as={FiEdit} color="blue.500" />
                      <Text color="white" fontWeight="medium">
                        Manual Adjustments
                      </Text>
                    </HStack>
                    <HStack>
                      <Text color={breakdown.manualAdjustment >= 0 ? 'green.400' : 'red.400'} fontWeight="bold">
                        {breakdown.manualAdjustment >= 0 ? '+' : ''}{breakdown.manualAdjustment} pts
                      </Text>
                      <AccordionIcon color="gray.400" />
                    </HStack>
                  </HStack>
                </AccordionButton>
                <AccordionPanel>
                  <Text color="gray.400" fontSize="sm">
                    Points manually adjusted by an administrator.
                  </Text>
                </AccordionPanel>
              </AccordionItem>
            )}
          </Accordion>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default StudentDetailedBreakdown;